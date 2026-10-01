"""Inspect an owner-supplied ZIP and preserve its bytes in a new private directory.

Extraction is not admission: seal and review the actual manifest/edition using
src/lib/source-admission.ts before selecting scientific content.
"""
from pathlib import Path
import argparse
import os
import shutil
import stat
import tempfile
import unicodedata
import zipfile


def unpack(archive: Path, destination: Path, wrapper: str):
    if destination.exists():
        raise ValueError('DESTINATION_EXISTS: never replace an existing edition')
    if '/' in wrapper or '\\' in wrapper or wrapper in ('', '.', '..'):
        raise ValueError('UNSAFE_ARCHIVE: invalid wrapper')
    with zipfile.ZipFile(archive) as bundle:
        seen = set()
        total = 0
        for entry in bundle.infolist():
            name = entry.filename.rstrip('/')
            parts = name.split('/')
            mode = entry.external_attr >> 16
            if (not name or name.startswith('/') or '\\' in name or ':' in name
                    or any(p in ('', '.', '..') for p in parts)
                    or any(ord(c) < 32 for c in name)
                    or parts[0] != wrapper or stat.S_ISLNK(mode)
                    or (stat.S_IFMT(mode) not in (0, stat.S_IFREG, stat.S_IFDIR))):
                raise ValueError('UNSAFE_ARCHIVE: ' + entry.filename)
            key = unicodedata.normalize('NFC', name).casefold()
            if key in seen:
                raise ValueError('ARCHIVE_COLLISION: ' + entry.filename)
            seen.add(key)
            total += entry.file_size
            if total > 20_000_000 or len(seen) > 2000:
                raise ValueError('ARCHIVE_LIMIT_EXCEEDED')
        destination.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix='.intake-', dir=destination.parent) as staging:
            staged = Path(staging) / 'files'
            staged.mkdir()
            for entry in bundle.infolist():
                parts = entry.filename.rstrip('/').split('/')[1:]
                if not parts:
                    continue
                target = staged.joinpath(*parts)
                if entry.is_dir():
                    target.mkdir(parents=True, exist_ok=True)
                else:
                    target.parent.mkdir(parents=True, exist_ok=True)
                    with bundle.open(entry) as source, target.open('xb') as output:
                        shutil.copyfileobj(source, output)
            os.rename(staged, destination)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', type=Path)
    parser.add_argument('destination', type=Path)
    parser.add_argument('--wrapper', default='RRG_CURRENT')
    options = parser.parse_args()
    try:
        unpack(options.archive, options.destination, options.wrapper)
    except (ValueError, zipfile.BadZipFile) as error:
        parser.exit(1, str(error) + '\n')
    print('EXTRACTED_BYTES_ONLY: scientific admission/review remains separate')
