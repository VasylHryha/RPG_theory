#!/usr/bin/env python3
"""Reproducible checks for the RRG research audit, 2026-09-30.

This verifies standard block-elimination identities for specified linear systems.
It does NOT simulate spontaneous assembly or establish a universal physical law.
Requires Python >=3.10 and NumPy. No external data or network access is used.
All model quantities are dimensionless. Fourier convention: exp(-i * omega * t).
"""
from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
import numpy as np
from numpy.typing import NDArray

Matrix = NDArray[np.complex128]


def network(seed: int | None = None) -> tuple[Matrix, Matrix, Matrix]:
    """An eight-site grounded spring chain with positive masses and damping."""
    n = 8
    if seed is None:
        masses, springs, ground = np.ones(n), np.ones(n-1), np.full(n, 0.4)
    else:
        rng = np.random.default_rng(seed)
        masses = rng.uniform(0.7, 1.4, n)
        springs = rng.uniform(0.5, 1.5, n-1)
        ground = rng.uniform(0.25, 0.65, n)
    M = np.diag(masses)
    K = np.diag(ground)
    for i, k in enumerate(springs):
        K[i, i] += k
        K[i+1, i+1] += k
        K[i, i+1] -= k
        K[i+1, i] -= k
    C = 0.08 * M + 0.015 * K
    for name, A in [("M", M), ("C", C), ("K", K)]:
        if np.linalg.eigvalsh(A).min() <= 0:
            raise ValueError(f"{name} must be positive definite")
    return tuple(A.astype(complex) for A in (K, C, M))


def blocks(A: Matrix, keep: list[int]) -> tuple[Matrix, Matrix, Matrix, Matrix]:
    if len(set(keep)) != len(keep) or not keep:
        raise ValueError("Retained coordinates must be distinct and nonempty")
    if any(i < 0 or i >= len(A) for i in keep):
        raise IndexError("Retained index outside the system")
    omit = [i for i in range(len(A)) if i not in keep]
    return (A[np.ix_(keep, keep)], A[np.ix_(keep, omit)],
            A[np.ix_(omit, keep)], A[np.ix_(omit, omit)])


def reduce_operator(A: Matrix, keep: list[int]) -> Matrix:
    """Exact Schur complement. Invertibility of the eliminated block is required."""
    aa, ab, ba, bb = blocks(A, keep)
    if bb.size == 0:
        return aa.copy()
    return aa - ab @ np.linalg.solve(bb, ba)


def rel_error(estimate: Matrix, reference: Matrix) -> float:
    return float(np.linalg.norm(estimate - reference) / max(np.linalg.norm(reference), 1e-300))


def taylor_reduction(K: Matrix, C: Matrix, M: Matrix, keep: list[int]) -> list[Matrix]:
    """Taylor coefficients through s^2 of the exact D_eff(s), D(s)=K+sC+s^2M.

    This is a LOCAL low-frequency approximation, not an exact constant-coefficient
    model and not an optimized fit over the whole frequency interval.
    """
    parts = [blocks(A, keep) for A in (K, C, M)]
    B0 = np.linalg.solve(parts[0][3], np.eye(parts[0][3].shape[0]))
    B1 = -B0 @ parts[1][3] @ B0
    B2 = B0 @ parts[1][3] @ B0 @ parts[1][3] @ B0 - B0 @ parts[2][3] @ B0
    Bs = [B0, B1, B2]
    coeffs = []
    for n in range(3):
        result = parts[n][0].copy()
        for i in range(n+1):
            for j in range(n-i+1):
                k = n-i-j
                result -= parts[i][1] @ Bs[j] @ parts[k][2]
        coeffs.append(result)
    return coeffs


def sweep(seed: int | None, samples: int) -> list[dict[str, float]]:
    K, C, M = network(seed)
    keep4, keep2 = [0, 2, 4, 6], [0, 6]
    nested_keep = [keep4.index(i) for i in keep2]
    low = taylor_reduction(K, C, M, keep2)
    rows = []
    for omega in np.linspace(0.0, 3.0, samples):
        s = -1j * omega
        D = K + s*C + s*s*M
        direct = reduce_operator(D, keep2)
        nested = reduce_operator(reduce_operator(D, keep4), nested_keep)
        full_response = np.linalg.solve(D, np.eye(8))[np.ix_(keep2, keep2)]
        exact_response = np.linalg.solve(direct, np.eye(2))
        approximate = low[0] + s*low[1] + s*s*low[2]
        approximate_response = np.linalg.solve(approximate, np.eye(2))
        rows.append({
            "omega": float(omega),
            "nested_vs_direct_operator_relative_error": rel_error(nested, direct),
            "reduced_vs_full_response_relative_error": rel_error(exact_response, full_response),
            "quadratic_approximation_response_relative_error": rel_error(approximate_response, full_response),
        })
    return rows


def feedback_example() -> list[dict[str, float]]:
    """Ideal adiabatic cavity/spring illustration, q0=kappa=b=m=1.

    E(q,I)=0.5(q-1)^2+I/q, q>0. The wave action I is held fixed during
    each calculation, not the wave energy. omega(q)=1/q. Bisection locates
    the unique q>=1 solving (q-1)q^2=I.
    """
    out = []
    for I in [0.0, 0.1, 1.0, 5.0]:
        lo, hi = 1.0, 2.0 + I
        for _ in range(100):
            q = (lo + hi) / 2.0
            if (q-1)*q*q > I:
                hi = q
            else:
                lo = q
        q = (lo+hi)/2
        force = -(q-1)+I/q**2
        stiffness = 1+2*I/q**3
        out.append({"wave_action": I, "equilibrium_size": q,
                    "wave_frequency": 1/q,
                    "restoring_stiffness": stiffness,
                    "mechanical_small_signal_frequency": float(np.sqrt(stiffness)),
                    "force_residual": force})
    return out


def run(output_dir: Path) -> dict:
    output_dir.mkdir(parents=True, exist_ok=True)
    main = sweep(None, 601)
    controls = [sweep(seed, 301) for seed in range(16)]
    exact1 = "nested_vs_direct_operator_relative_error"
    exact2 = "reduced_vs_full_response_relative_error"
    approx = "quadratic_approximation_response_relative_error"
    results = {
        "status": "Standard linear-response identity checked numerically; NOT spontaneous hierarchy or RRG proof",
        "parameters": {"sites": 8, "mass": 1, "nearest_neighbor_spring": 1,
                       "ground_spring": 0.4, "C": "0.08 M + 0.015 K",
                       "first_retained_indices": [0, 2, 4, 6], "final_retained_indices": [0, 6],
                       "omega_min": 0, "omega_max": 3, "main_samples": 601,
                       "random_control_seeds": list(range(16)), "control_samples_each": 301,
                       "internal_forcing": 0},
        "main": {"max_nested_direct_operator_relative_error": max(r[exact1] for r in main),
                 "max_reduced_full_response_relative_error": max(r[exact2] for r in main),
                 "max_local_quadratic_response_error_omega_le_0_1": max(r[approx] for r in main if r['omega'] <= 0.1),
                 "max_local_quadratic_response_error_omega_le_0_5": max(r[approx] for r in main if r['omega'] <= 0.5),
                 "max_local_quadratic_response_error_full_range": max(r[approx] for r in main),
                 "worst_local_quadratic_error_omega": max(main, key=lambda r:r[approx])["omega"]},
        "random_controls": {"max_nested_direct_operator_relative_error": max(r[exact1] for group in controls for r in group),
                            "max_reduced_full_response_relative_error": max(r[exact2] for group in controls for r in group)},
        "adiabatic_feedback_example": feedback_example(),
        "limitations": ["Network and retained coordinates were specified, not self-assembled.",
                        "The exact reduced operator is frequency dependent, generally not K_eff+s C_eff+s^2 M_eff with constants.",
                        "The quadratic comparison is the Taylor approximation at zero frequency, not a globally optimized reduced model.",
                        "Internal initial conditions and internal applied forces require extra effective source terms.",
                        "All quantities are dimensionless toy parameters, not particle or biological data."]}
    if results['main']['max_reduced_full_response_relative_error'] > 1e-10:
        raise AssertionError("Unexpected loss of precision in exact response elimination")
    if results['random_controls']['max_nested_direct_operator_relative_error'] > 1e-10:
        raise AssertionError("Unexpected loss of precision in nested elimination")
    with (output_dir / "response_errors.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(main[0]))
        writer.writeheader()
        writer.writerows(main)
    (output_dir / "verification_results.json").write_text(json.dumps(results, indent=2) + '\n', encoding="utf-8")
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=Path(__file__).resolve().parent)
    args = parser.parse_args()
    print(json.dumps(run(args.output_dir), indent=2))
