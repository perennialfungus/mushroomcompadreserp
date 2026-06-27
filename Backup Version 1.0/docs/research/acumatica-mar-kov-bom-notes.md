# Acumatica and Mar-Kov BOM Modeling Notes

Researched on 2026-06-27.

## Sources

- Acumatica 2026 R1 Manufacturing guide, `AcumaticaERP_Manufacturing.pdf`, downloaded from the current Acumatica product documentation index: https://help.acumatica.com/Help
- Mar-Kov batch manufacturing overview: https://mar-kov.com/
- Mar-Kov formulation control: https://mar-kov.com/formulation-control/
- Mar-Kov MES: https://mar-kov.com/manufacturing-execution-system/
- Mar-Kov MRP: https://mar-kov.com/material-requirements-planning/
- Mar-Kov financials and costing: https://mar-kov.com/financials-and-costing/

## Acumatica BOM Configuration Pattern

Acumatica treats the BOM as the manufacturing definition for a stock item. A BOM revision carries the product, revision, effective dates, status, yield/lot context, and an ordered operation list.

Important model points:

- A BOM must have at least one operation before it is production-ready.
- Operations are assigned to work centers and ordered by operation IDs such as `010`, `020`, `030` so new operations can be inserted later.
- Each operation can define setup time, labor run units/time, machine units/time, queue time, move time, finish time, labor backflush, scrap action, and control point behavior.
- Materials, steps, tools/machines, overhead, and outside processing settings belong to the selected operation, not just to the BOM header.
- The last operation is effectively the final control point because completed quantity and labor must be reported before the production order can close.
- BOM revisions should be locked or managed through change control once active.
- Cost rollup includes materials, labor, tools/machines, and overhead.

## Mar-Kov Batch Manufacturing Pattern

Mar-Kov is more batch-process and shop-floor oriented. The strongest relevant patterns are:

- Formulas/recipes need version control, approvals, audit trail, role-based access, automatic scaling, and real-time costing while editing.
- MES execution should enforce step-by-step SOPs with barcode validation for materials, lots, quantities, and equipment.
- Equipment usage, downtime, cleaning, inspection, and pre-use checks should be logged and linked to production batches.
- EBRs should capture timestamps, materials, equipment, operators, QA data, deviations, and signatures in one audit-ready record.
- MRP should use live inventory, sales, purchasing, production schedules, lead times, shelf life, and capacity constraints.
- Costing should compare estimated and actual cost at batch level, including material usage, labor, machine/equipment time, waste, yield loss, overhead, and landed cost.

## Implementation Decisions

The backend now models BOMs as the coordinator between formulation, routing, equipment, EBR, MRP, and costing:

- `@mushroom-compadres/domain` has a new `bom` module for BOM readiness and runtime calculation.
- BOM operations can use `manual`, `equipment`, or `mixed` runtime basis.
- BOM operation runtime calculates setup, manual run, machine run, queue, move, finish, equipment setup, and cleaning minutes.
- Active BOM validation requires at least one operation and a final control-point operation.
- API records now support operation-level steps, operation materials, and catalogued equipment assignments.
- Operation materials support manual issue or backflush, effectiveness dates, critical flags, and lot trace requirement.
- Operation equipment assignments point to catalogued equipment and can identify primary/required equipment plus setup, run, and cleaning time.
- `GET /api/production/boms` returns the BOM header, legacy material lines, nested operation details, and a calculated production plan.

## Follow-On Backend Work

- Add database migrations for the new BOM operation, step, material, and equipment tables.
- Add update/archive endpoints for BOM operations and controlled activation through change requests.
- Link BOM operation steps to EBR template step generation.
- Feed BOM operation materials into MRP explosion once operation-level BOMs replace legacy flat BOM lines.
- Feed BOM operation labor and equipment runtime into costing and finite-capacity planning.
- Add barcode/equipment readiness gates when production order operation runs are generated from BOM operations.
