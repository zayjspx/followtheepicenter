# active-claim-conflict — synthetic Slice 2 fixture

Two reviewed active claims have an explicit reviewed contradicts edge. Negative withdraws one claim.

Positive expected: exactly one active_claim_conflict candidate. Negative expected: no candidates from any of the six detectors.

All records are synthetic. vault/ is canonical fixture input; dist-data/ is generated. negative/vault/ is a concrete near miss.
