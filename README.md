SRA-Spider
==========
This module is part of the [Bond University Centre for Research in Evidence-Based Practice](https://github.com/CREBP) Systematic Review Assistant suite of tools.

The SRA-Spider module takes a reference library and attempts to 'spider' for other references - that is, look for citations chaining backwards and forwards.

This module is interacts with multiple databases and depends heavily on native IDs to access the chaining apis. As such, it is recommended that a reference library be foraged [SRA-Forager](https://github.com/CREBP/sra-forager) prior to spidering.


The operation is as follows:

1. Accept a reference library of multiple references as well as a configuration specifying directions and databases.
2. For each reference in the reference library, attempt to retrieve chained citations from each specified database for the specified directions.
3. References libraries for each direction, driver and reference are flattened into a single list and returned.