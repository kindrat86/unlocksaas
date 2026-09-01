from __future__ import annotations

import importlib.util
import io
import sqlite3
import sys
import tempfile
import types
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from typing import Any, cast
from unittest import mock


SCRIPT_PATH = Path(__file__).parents[1] / "scripts" / "sync-local-db.py"
SPEC = importlib.util.spec_from_file_location("sync_local_db", SCRIPT_PATH)
assert SPEC and SPEC.loader
sync_local_db = cast(Any, importlib.util.module_from_spec(SPEC))
lib_module = types.ModuleType("lib")
vault_module = types.ModuleType("lib.vault")
setattr(vault_module, "Vault", object)
with mock.patch.dict(sys.modules, {"lib": lib_module, "lib.vault": vault_module}):
    SPEC.loader.exec_module(sync_local_db)


class SyncLocalDbTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)
        db_dir = Path(self.temp_dir.name)
        self.db_path = db_dir / "funnel.db"
        sync_local_db.DB_DIR = db_dir
        sync_local_db.DB_PATH = self.db_path
        sync_local_db.ALERT_PATH = db_dir / "SYNC-BROKEN.md"

    def run_sync(self) -> int:
        with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
            with self.assertRaises(SystemExit) as exit_context:
                sync_local_db.main()
        code = exit_context.exception.code
        if not isinstance(code, int):
            self.fail(f"expected integer exit code, got {code!r}")
        return code

    def test_resend_failure_does_not_prevent_stripe_sync(self) -> None:
        stripe_customer = {
            "id": "cus_test",
            "email": "buyer@example.com",
            "name": "Buyer",
            "created": 1,
        }
        stripe_subscription = {
            "id": "sub_test",
            "customer": "cus_test",
            "status": "active",
            "items": {
                "data": [
                    {
                        "price": {
                            "id": "price_test",
                            "unit_amount": 1000,
                            "currency": "usd",
                            "recurring": {"interval": "month"},
                        }
                    }
                ]
            },
            "created": 2,
        }

        def stripe_pages(resource: str, _key: str, _params: str = "") -> list[dict]:
            return [stripe_customer] if resource == "customers" else [stripe_subscription]

        vault = mock.Mock()
        vault.get_key.return_value = "sk_test"
        with (
            mock.patch.object(
                sync_local_db,
                "resend",
                side_effect=sync_local_db.ResendFatalError("invalid key"),
            ),
            mock.patch.object(sync_local_db, "stripe_paged", side_effect=stripe_pages),
            mock.patch.object(sync_local_db, "Vault", return_value=vault),
            mock.patch.object(sync_local_db.subprocess, "run"),
        ):
            self.assertEqual(self.run_sync(), 1)

        db = sqlite3.connect(self.db_path)
        try:
            self.assertEqual(
                db.execute("SELECT id FROM stripe_customers").fetchall(),
                [("cus_test",)],
            )
            self.assertEqual(
                db.execute("SELECT id FROM stripe_subs").fetchall(),
                [("sub_test",)],
            )
            run = db.execute(
                """SELECT ok, customers, subs, error, resend_ok, stripe_ok
                   FROM sync_runs"""
            ).fetchone()
            self.assertEqual(run[:3], (0, 1, 1))
            self.assertIn("resend: ResendFatalError: invalid key", run[3])
            self.assertEqual(run[4:], (0, 1))
        finally:
            db.close()

    def test_stripe_failure_records_resend_as_successful(self) -> None:
        def resend_response(path: str) -> dict:
            if path == "/audiences":
                return {"data": [{"id": "aud_test", "name": "UnlockSaaS"}]}
            if path == "/audiences/aud_test/contacts":
                return {
                    "data": [
                        {
                            "email": "subscriber@example.com",
                            "unsubscribed": False,
                            "created_at": "2026-09-01T00:00:00Z",
                        }
                    ]
                }
            return {"data": []}

        vault = mock.Mock()
        vault.get_key.return_value = "sk_test"
        with (
            mock.patch.object(sync_local_db, "resend", side_effect=resend_response),
            mock.patch.object(
                sync_local_db,
                "stripe_paged",
                side_effect=RuntimeError("stripe unavailable"),
            ),
            mock.patch.object(sync_local_db, "Vault", return_value=vault),
            mock.patch.object(sync_local_db.time, "sleep"),
            mock.patch.object(sync_local_db.subprocess, "run"),
        ):
            self.assertEqual(self.run_sync(), 1)

        db = sqlite3.connect(self.db_path)
        try:
            self.assertEqual(
                db.execute("SELECT email FROM subscribers").fetchall(),
                [("subscriber@example.com",)],
            )
            run = db.execute(
                "SELECT subscribers, resend_ok, stripe_ok, error FROM sync_runs"
            ).fetchone()
            self.assertEqual(run[:3], (1, 1, 0))
            self.assertIn("stripe: RuntimeError: stripe unavailable", run[3])
        finally:
            db.close()

    def test_existing_sync_runs_table_gets_section_status_columns(self) -> None:
        db = sqlite3.connect(self.db_path)
        db.execute(
            """CREATE TABLE sync_runs (
               at TEXT, ok INTEGER, subscribers INTEGER, emails INTEGER,
               customers INTEGER, subs INTEGER, error TEXT)"""
        )
        db.execute(
            "INSERT INTO sync_runs VALUES (?,?,?,?,?,?,?)",
            ("before-migration", 1, 1, 2, 3, 4, None),
        )
        db.commit()
        db.close()

        vault = mock.Mock()
        vault.get_key.return_value = "sk_test"
        with (
            mock.patch.object(sync_local_db, "resend", return_value={"data": []}),
            mock.patch.object(sync_local_db, "stripe_paged", return_value=[]),
            mock.patch.object(sync_local_db, "Vault", return_value=vault),
        ):
            self.assertEqual(self.run_sync(), 0)

        db = sqlite3.connect(self.db_path)
        try:
            columns = {
                row[1] for row in db.execute("PRAGMA table_info(sync_runs)").fetchall()
            }
            self.assertTrue({"resend_ok", "stripe_ok"}.issubset(columns))
            rows = db.execute(
                "SELECT at, resend_ok, stripe_ok FROM sync_runs ORDER BY rowid"
            ).fetchall()
            self.assertEqual(rows[0], ("before-migration", None, None))
            self.assertEqual(rows[1][1:], (1, 1))
        finally:
            db.close()


if __name__ == "__main__":
    unittest.main()
