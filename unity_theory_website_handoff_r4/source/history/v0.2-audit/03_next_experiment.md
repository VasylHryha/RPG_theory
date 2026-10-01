# RRG v0.2 — Next experiment and acceptance criteria

## Research target

Test this limited proposition:

> A grouping method that preserves a system's relevant dynamic response identifies more useful higher-level units than grouping only by proximity, connectivity or mean phase.

This is not a test of all fundamental physics. It is a testable bridge from the geometry–mode intuition to a model-reduction and AI contribution.

## What should remain fixed

Before inspecting held-out outcomes, record the microscopic model, permitted observations, perturbation amplitudes, time/frequency range, environments, grouping procedure, representation budget and error metric.

Do not change the definition of “unit” after seeing a failed prediction. A change can start another explicitly versioned experiment.

## Stage 1 — Discovery in a dynamic physical network

Use one published geometry–phase model family, such as [S01], with its stated assumptions. Start with varied phases, positions and intrinsic parameters. No prescribed hierarchy or named particles.

Observe candidate groups, but do not identify them solely from equal frequencies or an average complex phase. Test their persistence, internal response, boundary interaction and survival under perturbations. An organized antiphase group must not automatically score as nonexistent.

There are two separate outcomes:

1. **Formation:** did groups emerge under the specified dynamics?
2. **Description:** can an independently chosen reduced representation predict their future external behavior?

A response model cannot establish that physical groups formed spontaneously. A clustering picture cannot establish predictive closure.

## Stage 2 — Represent the interface

For a candidate group, retain its boundary variables, a small set of internal modes or latent states, and a memory model when needed.

Compare five representations:

- proximity or static-graph grouping;
- mean-phase/amplitude supernodes;
- a local constant-coefficient oscillator approximation;
- response-preserving models with controlled mode/memory budgets;
- full microscopic simulation as reference, not as a competing cheap model.

The exact linear Schur model in this package is a calibration case. It is not automatically computationally cheaper, because its response still contains internal poles.

## Stage 3 — Out-of-sample prediction

Choose a numerical tolerance before testing. For a first pilot, 1% normalized output error over a declared moderate-disturbance regime is a possible engineering target, not a universal constant.

Test changes not used to select the representation: initial phase, force waveform, coupling perturbations, constituent count, and at least one background parameter.

Report prediction error, lifetime, number of retained state variables, memory-kernel complexity, parameter count, wall-clock time and the cost of discovering the representation. Count preprocessing and interface overhead instead of reporting only cheap inference.

## Stage 4 — Repeat one reduction

Reduce the discovered groups again. Compare direct microscopic predictions, first-level reduced predictions and second-level reduced predictions.

Require controlled error accumulation, not a pretty hierarchy drawing. Do not demand identical microscopic equations at both levels. Do demand a fixed derivation/discovery procedure and explicitly stated approximation rules.

A hierarchy that needs more hidden parameters than the original system is descriptive, but not an efficiency result.

## Stage 5 — Transfer to a chemical network

Use a separately specified mass-action reaction network with input/output species or chemostats. Apply the same response-aware selection principle, with chemical concentrations replacing mechanical displacements.

Use Chemical Organization Theory to reject structurally impossible persistent supports. Then test kinetic stability and response independently. A topology-only organization is not automatically a living or reproducing system.

Success means that the representation-selection procedure transfers, not that mechanical and chemical microscopic equations are identical.

## Stage 6 — AI evaluation only after the above

The candidate AI unit is a small dynamic module with a learned interface and compact internal memory, not necessarily one oscillator. Compose modules into larger modules and test prediction or control in a small environment.

Compare equal-budget RNN, graph-network and transformer baselines. Include the cost of routing, hierarchy discovery and retained memory. Claims of better sample efficiency, robustness or energy efficiency require measurements; fewer visible nodes alone are insufficient.

## Failure diagnoses

- **No groups form:** that microscopic model and parameter range did not demonstrate the proposed assembly mechanism.
- **Groups form but cannot be compressed:** persistence is not enough for useful predictive simplicity.
- **Compression works only over a tiny frequency band:** state the domain; do not call it universal.
- **Memory is essential:** preserve it rather than counting it as a philosophical objection to RRG.
- **Second reduction loses accuracy:** retain more state or acknowledge closure failure at that scale.
- **Cross-domain transfer fails:** the proposed common procedure is not yet supported.
- **AI overhead exceeds savings:** the architecture has no demonstrated practical advantage.

No single failed toy proves that every possible version of RRG is impossible. But a version must be narrow enough to admit a definite failed test without being renamed into success.

## Publication scope

A credible first result would be a methods paper with explicit assumptions, a reproducible reduction procedure, cross-domain tests, ablations and error/cost results. The current package is a research audit plus verification of known algebra, not such a completed methods paper and not a Theory of Everything.
