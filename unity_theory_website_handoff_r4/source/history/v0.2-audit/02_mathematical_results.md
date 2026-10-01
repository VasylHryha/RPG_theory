# RRG v0.2 — Worked mathematics, scope and numerical verification

**Date:** 30 September 2026.  
All calculations below use specified effective models. They are not a derivation of the Standard Model, gravity or life. The exact reduction identity is established linear algebra; the numerical work verifies its application here.

## A. Separate state, law and response

Let \(x\) denote physical state, \(B\) the environment and \(F\) the governing dynamical law:

\[
\dot x=F(x;B).
\]

A relational description \(G\) records relevant arrangement and constraints. It does not, by itself, specify masses, interaction strengths or the full law. These must be measured, supplied, or derived. Defining all of \(F\) to be part of “geometry” is possible as vocabulary but does not derive \(F\).

Near a reference state \(x_*\):

\[
\delta\dot x=J\delta x+\mathsf B u,
\qquad y=\mathsf C\delta x.
\]

The small-signal response is

\[
\chi(s)=\mathsf C(sI-J)^{-1}\mathsf B.
\]

Oscillatory modes, relaxation, amplification and damping appear in this response. Nonlinear behavior outside the neighborhood is not determined by this linear response alone.

## B. Stationary is not automatically stable

The two laws

\[
\dot x=-x,\qquad\dot x=+x
\]

both satisfy \(F(0)=0\). Their solutions are \(x_0e^{-t}\) and \(x_0e^t\), respectively. Self-consistency of the state is therefore not a stability criterion.

For a smooth finite-dimensional autonomous system, all eigenvalues of \(J\) having strictly negative real part is sufficient for local asymptotic stability of a hyperbolic equilibrium. Zero eigenvalues require further analysis; conserved/symmetry directions cannot simply be called unstable. Periodic solutions require transverse Floquet stability. Conservative stable oscillations need not attract neighboring trajectories.

Write a mode exponent as

\[
s_j=-\gamma_j+i\omega_j.
\]

The imaginary part describes oscillation, while the real part controls linear growth/decay. A valid stable mode can have \(\omega_j=0\). This retains RRG's broad temporal interpretation without insisting on ongoing periodic motion.

## C. Correct geometry–force–frequency relation

For a conservative mechanical model with positive mass matrix \(M\), kinetic energy \(T\), and potential \(U(q)\),

\[
S[q]=\int (T-U)dt,
\qquad F=-\nabla U.
\]

At an equilibrium \(q_*\), \(\nabla U(q_*)=0\). In the harmonic approximation,

\[
K=\nabla^2U(q_*),\qquad M\delta\ddot q+K\delta q=0,
\]

so

\[
\boxed{Ku_j=\omega_j^2Mu_j.}
\]

An effective action \(\Gamma\) can generate equations through functional variation, but is not generally interchangeable with \(U\). A static effective potential may be extracted only after the appropriate reduction and normalization. This corrects the old blanket formula \(F=-\partial\Gamma/\partial q\).

## D. An explicit two-way geometry–mode example

Use an ideal cavity length \(q>0\) with a slow mechanical restoring potential and one fast wave mode. Assume adiabatic motion and fixed wave action \(I\); do not hold wave energy fixed. In an ideal fixed-occupation quantum version, the corresponding action is proportional to occupation times \(\hbar\), with any vacuum contribution specified separately.

Choose

\[
\omega(q)=\frac{b}{q},\quad b>0,
\qquad
\mathcal E(q,I)=\frac{\kappa}{2}(q-q_0)^2+I\omega(q).
\]

This is a simplified optomechanical setting, motivated by [S02]. It assumes the mechanical potential and dispersion relation rather than deriving them.

At fixed \(I\),

\[
F(q,I)=-\frac{\partial\mathcal E}{\partial q}
=-\kappa(q-q_0)+\frac{Ib}{q^2}.
\]

Hence the equilibrium solves

\[
\boxed{\kappa(q_*-q_0)q_*^2=Ib.}
\]

For \(q_0>0\), \(I\geq0\), the left side increases strictly for \(q\geq q_0\), from zero to infinity. There is exactly one equilibrium in that interval. Its stiffness is

\[
\mathcal E_{qq}(q_*,I)=\kappa+\frac{2Ib}{q_*^3}>0.
\]

Thus changing the wave state changes the equilibrium geometry; the changed geometry changes the wave frequency. This closes a **particular** feedback model, not a universal theory.

With \(\kappa=q_0=b=1\):

| Fixed wave action \(I\) | Equilibrium size \(q_*\) | Wave frequency \(1/q_*\) | Restoring stiffness |
|---:|---:|---:|---:|
| 0 | 1.000000 | 1.000000 | 1.000000 |
| 0.1 | 1.084953 | 0.921699 | 1.156602 |
| 1 | 1.465571 | 0.682328 | 1.635344 |
| 5 | 2.116343 | 0.472513 | 2.054974 |

These are dimensionless numerical values from the bundled script. At \(I=0\), the mechanical equilibrium still exists: this model itself does not support the claim that an occupied oscillatory mode is necessary for every stable form.

## E. Exact preservation of response across reductions

### E1. Starting model

For a linear network,

\[
M\ddot q+C\dot q+Kq=f(t),
\]

assume \(M,K\) are positive definite and \(C\) provides positive damping. For \(q(t)=\hat q e^{-i\omega t}\),

\[
D(\omega)\hat q=\hat f,
\qquad
D(\omega)=K-\omega^2M-i\omega C.
\]

Here \(D\) denotes dynamic stiffness, **not** the Dirac operator in spectral-triple geometry. Reusing the letter does not equate the frameworks.

Partition coordinates into retained/interface coordinates \(a\) and internal coordinates \(b\):

\[
\begin{pmatrix}D_{aa}&D_{ab}\\D_{ba}&D_{bb}\end{pmatrix}
\begin{pmatrix}q_a\\q_b\end{pmatrix}
=
\begin{pmatrix}f_a\\0\end{pmatrix}.
\]

Assume \(D_{bb}\) is invertible at the frequency considered. The second equation gives

\[
q_b=-D_{bb}^{-1}D_{ba}q_a.
\]

Substitution yields

\[
\boxed{D_{\rm eff}=D_{aa}-D_{ab}D_{bb}^{-1}D_{ba}.}
\]

This is a Schur complement; the static graph-Laplacian case underlies Kron reduction [S08]. No claim of novelty is made for this identity.

### E2. What is preserved

When the full response exists,

\[
\boxed{[D^{-1}]_{aa}=D_{\rm eff}^{-1}.}
\]

The reduced model has exactly the same relation between applied interface force and observed interface motion. Internal coordinates have not stopped moving. Their effect remains in the second term of \(D_{\rm eff}\).

If there is internal forcing, the right-hand side becomes

\[
f_{a,\rm eff}=f_a-D_{ab}D_{bb}^{-1}f_b.
\]

Internal initial conditions likewise require effective source/history terms; they cannot be discarded without an assumption.

### E3. Repetition

Divide the internal coordinates into two sets. Eliminate one set and then the other. Alternatively, eliminate their union directly. Both procedures solve the same linear system for the same retained coordinates, hence give the same Schur complement whenever the necessary inverses exist.

Thus there is an exact repeated reduction procedure in this model class. It is an **equivalence of descriptions**, not a physical creation of new objects.

### E4. Why a constant-coefficient oscillator is insufficient in general

\(D_{bb}^{-1}(\omega)\) contains the internal resonances. Consequently, the exact \(D_{\rm eff}(\omega)\) is usually a rational frequency-dependent function, not simply another quadratic polynomial in \(\omega\) with constant effective mass, damping and stiffness.

Keeping only a few interface coordinates can therefore hide many internal modes inside a complicated response. Exact reduction alone does not guarantee less storage, less computation, or a new independent physical scale. Practical compression requires an approximation whose error and cost are measured.

This distinction corrects the old requirement that every level be described by the same small memoryless oscillator equation.

## F. Numerical verification actually performed

The script specifies eight unit masses, nearest-neighbor springs of strength 1, grounding springs of strength 0.4, and

\[
C=0.08M+0.015K.
\]

It retains coordinates \([0,2,4,6]\), then \([0,6]\), and compares this 8→4→2 route with direct 8→2 reduction. Internal forcing is zero. It evaluates 601 angular frequencies from 0 to 3.

Relative errors use the Frobenius norm, normalized by the reference matrix norm.

| Test | Maximum relative error |
|---|---:|
| Nested versus direct reduced operator | 2.4914 × 10^-15 |
| Reduced versus full interface response | 2.2605 × 10^-15 |
| Nested versus direct, across 16 randomly perturbed networks | 3.2674 × 10^-15 |
| Reduced versus full response, across those networks | 2.9432 × 10^-15 |

The control networks vary positive masses, springs and grounding strengths with fixed seeds 0–15; each is checked at 301 frequencies. Details and raw errors are in the script, JSON and CSV.

A second comparison uses the Taylor expansion of the exact reduced operator through second order at zero frequency. This is a specified low-frequency approximation, **not** the best possible globally fitted reduced model.

| Range | Maximum relative response error of the local quadratic approximation |
|---|---:|
| 0 ≤ omega ≤ 0.1 | 0.0001180 (0.0118%) |
| 0 ≤ omega ≤ 0.5 | 0.1108484 (11.0848%) |
| 0 ≤ omega ≤ 3 | 3.4636163 (346.3616%) |

The worst full-range value occurs at omega = 0.835. These results illustrate an approximation's domain of validity; they do not prove that every simple reduced model must fail by this amount.

**Not tested:** adaptive assembly, spontaneous clustering, automatic choice of interfaces, nonlinear transitions, molecules, life, gravity or AI performance.

## G. Where the hidden dynamics go: an exact memory derivation

For a first-order linear system,

\[
\dot x=Ax+By,\qquad \dot y=Cx+Dy,
\]

solve the internal equation:

\[
y(t)=e^{Dt}y(0)+\int_0^t e^{D(t-s)}Cx(s)\,ds.
\]

Substituting back,

\[
\boxed{\dot x(t)=Ax(t)+Be^{Dt}y(0)+\int_0^t Be^{D(t-s)}Cx(s)\,ds.}
\]

The coarse variable responds to its history. This elementary derivation demonstrates the mechanism behind the more general projection-operator treatment referenced in [S09]. For stochastic and nonlinear systems, exact reduced descriptions can also involve noise and state-dependent memory.

This is especially consistent with RRG's premise that smaller dynamics remain active inside a larger organization. Removing coordinates from a description is not removing their physical influence.

## H. A chemistry test, not another oscillator assumption

Let reaction stoichiometry be \(S\), concentrations \(x\), and reaction rates \(v\). With environment \(B\),

\[
\dot x=S v(x;B).
\]

Reaction geometry corresponds partly to the stoichiometric network; timing and resource dependence enter through \(v\). Chemical Organization Theory supplies a conditional structural test for fixed-point supports [S03]. It does not guarantee that a candidate network is stable, reachable or reproducing.

A separate elementary propagation example is

\[
A+X\longrightarrow2X,\qquad X\longrightarrow W.
\]

With precursor \([A]=a\) maintained by a reservoir, mass-action kinetics give

\[
\dot x=(ka-\delta)x.
\]

The model predicts amplification only if \(ka>\delta\). A long-lived but catalytically inactive structure may have small \(\delta\) and still fail to copy itself. The chemical reaction and reservoir are assumptions, not consequences derived from stability alone.

For an independently formed population, \(\dot n=r-\delta n\), the steady abundance is \(r/\delta\). This makes the separate role of formation rate explicit. RRG's abstract pattern-propagation category can contain both models, but their measurable predictions differ.

For driven chemistry, include energy and entropy exchange rather than imposing decreasing energy on the organism alone. Open-network thermodynamic constructions such as [S15] are an appropriate starting point.

## I. Correct nonlinear coarse-graining condition

For a differentiable retained state \(y=P(x)\),

\[
\dot y=DP(x)F(x).
\]

A closed memoryless higher-level law exists exactly only if some \(F_{\rm eff}\) satisfies

\[
\boxed{DP(x)F(x)=F_{\rm eff}(P(x))}
\]

throughout the stated domain. Equivalently, all microscopic states identified by \(P\) must induce the same coarse evolution. The earlier formula \(P\circ F=F_{\rm eff}\circ P\) omits the derivative of \(P\) unless \(P\) is a suitable linear map.

A practical approximation can instead preserve observables over a finite horizon and input class. Report held-out error, dependence on environment, and computational cost. When memory matters, enlarge the retained state or use an explicit history-dependent law.

## J. What would count as an RRG contribution

The calculations above reproduce known mathematical mechanisms. A distinct contribution would be a principled method for **discovering** useful interfaces and retained modes, deriving their responses, and transferring the procedure to another system class with bounded error and lower cost.

Automatic hierarchical discovery has not been implemented here. Nor has a universal invariant connecting all forces, chemistry and cognition been derived. These remaining claims are not negated by this audit; they are separated from the restricted results that have actually been established.
