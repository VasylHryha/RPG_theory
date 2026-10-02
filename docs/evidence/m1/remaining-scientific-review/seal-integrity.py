"""Seal this receipt, preserving the pre-pass dirty baseline. No approval writer."""
import datetime
import hashlib
import json
import pathlib
import subprocess
import zipfile

root = pathlib.Path(__file__).resolve().parents[4]
folder = root / "docs/evidence/m1/remaining-scientific-review"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def git(*args):
    return subprocess.check_output(["git", *args], cwd=root, text=True).strip()


baseline = json.loads((folder / "baseline.json").read_text())
verified = json.loads((folder / "verification.json").read_text())
assert verified["status"] == "PASS"
assert git("rev-parse", "HEAD") == baseline["head"]
assert git("branch", "--show-current") == "main"
assert git("remote") == ""
assert git("diff", "--cached", "--name-only") == ""
changed = [r for r in baseline["files"] if digest(root / r["path"]) != r["sha256"]]
plan = "docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md"
assert [r["path"] for r in changed] == [plan]
assert digest(folder / "prior-plan.md") == changed[0]["sha256"]
assert len(baseline["files"]) == 4223
assert verified["reviewRegistryUnchanged"] is True
assert verified["scientificQualification"] is False
assert len(verified["acceptedRepresentationIds"]) == 18
assert len(verified["pendingExactReviewIds"]) == 16

# Fresh raw archive parity, independent of the earlier archive receipt's PASS label.
prior = json.loads((root / "docs/evidence/m1/scientific-review/archive-parity.json").read_text())
archive = root / prior["archive"]
assert digest(archive) == prior["archiveSha256"]
with zipfile.ZipFile(archive) as package:
    members = [r.filename for r in package.infolist() if not r.is_dir()]
    assert sorted(members) == sorted(r["zipMember"] for r in prior["files"])
    for row in prior["files"]:
        raw = (root / row["path"]).read_bytes()
        assert package.read(row["zipMember"]) == raw
        assert digest(root / row["path"]) == row["sha256"]
        assert len(raw) == row["bytes"]

ledger = json.loads((folder / "access-ledger.json").read_text())
assert ledger["newExactApprovals"] == 0 and ledger["scientificQualification"] is False
assert len(ledger["reads"]) == 20
subprocess.run(["git", "diff", "--check", "--", plan], cwd=root, check=True)
files = []
for path in sorted(folder.iterdir()):
    if path.is_file() and path.name not in ("final-integrity.json", "final-integrity.log"):
        files.append({"path": str(path.relative_to(root)), "bytes": path.stat().st_size, "sha256": digest(path)})
files.append({"path": plan, "bytes": (root / plan).stat().st_size, "sha256": digest(root / plan)})
receipt = {
    "date": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "status": "PASS",
    "head": git("rev-parse", "HEAD"),
    "branch": "main",
    "remotes": [],
    "stagedPaths": [],
    "finalStatus": git("status", "--short"),
    "baselineSha256": digest(folder / "baseline.json"),
    "protectedBaselineFiles": 4223,
    "unchangedBaselineFiles": 4222,
    "changedBaselineFiles": [plan],
    "priorPlanRawPreserved": True,
    "existingPublicationTestsAndScientificReviewUnchanged": True,
    "archiveAndAll13CurrentMembersRawParity": "PASS",
    "scientificSourceEdits": 0,
    "reviewRegistryEdits": 0,
    "productionInputs": verified["productionInputs"],
    "acceptedRepresentationIds": verified["acceptedRepresentationIds"],
    "pendingExactReviewIds": verified["pendingExactReviewIds"],
    "currentSourceQualified": False,
    "admissionContentReview": "pending",
    "scientificExecutionRecords": 0,
    "m1": "REVIEW_READY",
    "m2": "NOT_STARTED",
    "newProductionRepairs": 0,
    "newExactApprovals": 0,
    "freshVerification": "verification.json; its retained/fresh results are explicitly distinguished",
    "publicAction": "NOT_RUN",
    "taskFiles": files,
    "sealExclusions": ["final-integrity.json (self)", "final-integrity.log (output)"],
}
(folder / "final-integrity.json").write_text(json.dumps(receipt, indent=2) + "\n")
print("PASS: 4222 baseline files unchanged; exact prior plan preserved; all 13 raw ZIP members match; evidence sealed; HEAD/main/no remote/empty index preserved.")
