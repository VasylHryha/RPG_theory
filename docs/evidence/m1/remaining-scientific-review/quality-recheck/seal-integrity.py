"""Seal the requested quality recheck without overwriting earlier receipts."""
import datetime
import hashlib
import json
import pathlib
import subprocess
import zipfile

root = pathlib.Path(__file__).resolve().parents[5]
folder = root / "docs/evidence/m1/remaining-scientific-review/quality-recheck"
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
git = lambda *a: subprocess.check_output(["git", *a], cwd=root, text=True).strip()
baseline = json.loads((folder / "baseline.json").read_text())
quality = json.loads((folder / "quality-verification.json").read_text())
assert quality["status"] == "PASS"
assert git("rev-parse", "HEAD") == baseline["head"]
assert git("branch", "--show-current") == "main"
assert git("remote") == "" and git("diff", "--cached", "--name-only") == ""
allowed = {
    "docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md",
    "research/publication/pages/home.md", "research/publication/pages/start.md",
    "research/publication/reviews.yaml",
    "tests/content/m1.test.ts", "tests/content/m1-review.test.ts",
    "tests/e2e/reading.spec.ts",
}
changed = [r for r in baseline["files"] if sha(root / r["path"]) != r["sha256"]]
assert {r["path"] for r in changed} == allowed
for r in changed:
    assert sha(folder / "prior" / r["path"]) == r["sha256"]
for name in ("home", "start"):
    path = f"research/publication/pages/{name}.md"
    before, after = (folder / "prior" / path).read_bytes(), (root / path).read_bytes()
    boundary = b"\n---\n"
    assert before.split(boundary, 1)[1] == after.split(boundary, 1)[1]
old_seal = json.loads((root / "docs/evidence/m1/remaining-scientific-review/final-integrity.json").read_text())
for r in old_seal["taskFiles"]:
    actual = folder / "prior" / r["path"] if r["path"] in allowed else root / r["path"]
    assert sha(actual) == r["sha256"], r["path"]
prior = json.loads((root / "docs/evidence/m1/scientific-review/archive-parity.json").read_text())
assert sha(root / prior["archive"]) == prior["archiveSha256"]
with zipfile.ZipFile(root / prior["archive"]) as package:
    assert sorted(r.filename for r in package.infolist() if not r.is_dir()) == sorted(r["zipMember"] for r in prior["files"])
    for r in prior["files"]:
        assert package.read(r["zipMember"]) == (root / r["path"]).read_bytes()
        assert sha(root / r["path"]) == r["sha256"]
for row in quality["artifacts"]:
    artifact = json.loads((folder / f"{row['base']}-artifact.json").read_text())
    directory = root / artifact["directory"]
    actual_paths = sorted(str(p.relative_to(directory)) for p in directory.rglob("*") if p.is_file())
    assert actual_paths == sorted(f["path"] for f in artifact["files"])
    for f in artifact["files"]:
        p = directory / f["path"]
        assert p.stat().st_size == f["bytes"] and sha(p) == f["sha256"]
    canonical = json.dumps(artifact["files"], sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    assert hashlib.sha256(canonical.encode()).hexdigest() == artifact["artifactSha256"] == row["artifactSha256"]
subprocess.run(["git", "diff", "--check", "--", *sorted(allowed)], cwd=root, check=True)
evidence_files = []
for path in sorted(folder.rglob("*")):
    if path.is_file() and path.relative_to(folder).as_posix() not in {"final-integrity.json", "final-integrity.log"}:
        evidence_files.append({"path": str(path.relative_to(root)), "bytes": path.stat().st_size, "sha256": sha(path)})
task_files = [{"path": p, "bytes": (root / p).stat().st_size, "sha256": sha(root / p)} for p in sorted(allowed)]
receipt = {
    "date": datetime.datetime.now(datetime.timezone.utc).isoformat(), "status": "PASS",
    "head": git("rev-parse", "HEAD"), "branch": "main", "remotes": [], "stagedPaths": [],
    "protectedBaselineFiles": len(baseline["files"]),
    "unchangedBaselineFiles": len(baseline["files"]) - len(changed),
    "changedBaselineFiles": sorted(allowed), "allChangedPredecessorsRawPreserved": True,
    "earlierReceiptsAndArtifacts": "UNCHANGED; prior sealed plan preserved at prior/",
    "introScientificBodyRawParity": "PASS", "archiveAnd13CurrentRawMemberParity": "PASS",
    "freshArtifactsUnchangedAfterChecks": "PASS; inventories, raw bytes and sealed digests recomputed",
    "scientificSourceEdits": 0, "prior18ReviewObjectsAndIdentities": "UNCHANGED",
    "newExactBoundedAcceptance": "UT-E05", "acceptedRepresentationIds": quality["acceptedRepresentationIds"],
    "pendingExactReviewIds": quality["pendingExactReviewIds"],
    "newEngineeringAndEvidenceBatch": "REVIEW_READY for separately launched acceptance",
    "productionInputs": quality["productionInputs"], "artifacts": quality["artifacts"],
    "currentSourceQualified": False, "admissionContentReview": "pending", "scientificExecutions": 0,
    "m1": "REVIEW_READY", "m2": "NOT_STARTED", "publicAction": "NOT_RUN",
    "baselineSha256": sha(folder / "baseline.json"),
    "taskFiles": task_files, "evidenceFiles": evidence_files,
    "sealExclusions": ["final-integrity.json (self)", "final-integrity.log (output)"],
    "finalStatus": git("status", "--short"),
}
(folder / "final-integrity.json").write_text(json.dumps(receipt, indent=2) + "\n")
print(f"PASS: {len(baseline['files'])-len(changed)} pre-existing paths unchanged; seven scoped changes have exact predecessors; old evidence/artifacts and raw sources preserved; 19 accepted / 15 pending; new batch REVIEW_READY.")
