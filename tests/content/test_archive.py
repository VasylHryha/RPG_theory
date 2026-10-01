import importlib.util
from pathlib import Path
import stat
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('intake', Path(__file__).parents[2] / 'scripts/intake_archive.py')
intake = importlib.util.module_from_spec(spec)
spec.loader.exec_module(intake)


class ArchiveControls(unittest.TestCase):
    def check_members(self, names, diagnostic):
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            with zipfile.ZipFile(root / 'source.zip', 'w') as bundle:
                for name in names:
                    bundle.writestr(name, b'preserved\r\nbytes\n')
            if diagnostic:
                with self.assertRaisesRegex(ValueError, diagnostic):
                    intake.unpack(root / 'source.zip', root / 'edition', 'RRG_CURRENT')
                self.assertFalse((root / 'edition').exists())
            else:
                intake.unpack(root / 'source.zip', root / 'edition', 'RRG_CURRENT')
                self.assertEqual((root / 'edition/core.md').read_bytes(), b'preserved\r\nbytes\n')

    def test_safe(self):
        self.check_members(['RRG_CURRENT/core.md'], None)

    def test_paths(self):
        for name in ['RRG_CURRENT/../evil', '/RRG_CURRENT/evil', 'OTHER_ROOT/core.md', 'RRG_CURRENT\\evil', 'RRG_CURRENT/./evil', 'RRG_CURRENT/C:/evil']:
            with self.subTest(name=name):
                self.check_members([name], 'UNSAFE_ARCHIVE')

    def test_collision(self):
        self.check_members(['RRG_CURRENT/Core.md', 'RRG_CURRENT/core.md'], 'ARCHIVE_COLLISION')

    def test_symlink(self):
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            with zipfile.ZipFile(root / 'source.zip', 'w') as bundle:
                entry = zipfile.ZipInfo('RRG_CURRENT/link')
                entry.create_system = 3
                entry.external_attr = (stat.S_IFLNK | 0o777) << 16
                bundle.writestr(entry, '/tmp/target')
            with self.assertRaisesRegex(ValueError, 'UNSAFE_ARCHIVE'):
                intake.unpack(root / 'source.zip', root / 'edition', 'RRG_CURRENT')
