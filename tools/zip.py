"""Package one authored directory. Never follows symlinks or includes runtime files."""
from pathlib import Path
import sys, zipfile

source, destination = map(Path, sys.argv[1:3])
assert source.is_dir() and not destination.exists(), 'Use a new archive path.'
destination.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for file in sorted(source.rglob('*')):
        assert not file.is_symlink(), str(file)
        if not file.is_file():
            continue
        assert file.name not in {'LOCK', 'LOG'} and not file.name.startswith('LOG.old'), str(file)
        info = zipfile.ZipInfo((Path(source.name) / file.relative_to(source)).as_posix(), (2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, file.read_bytes())
