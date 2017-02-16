SRA-Spider
==========
This module is part of the [Bond University Centre for Research in Evidence-Based Practice](https://github.com/CREBP) Systematic Review Assistant suite of tools.


The SRA-Spider module takes a reference library and attempts to 'spider' for other references - that is, look for citations from and to each reference.


The operation is as follows:

1. Accept a reference library of multiple references
2. Extract DOI information from each reference
3. Use [CrossRef](FIXME) to look up each DOI and retrieve citations to and from the given DOI. From this compile a second reference library of DOIs 
4. Use [PubMed](FIXME) to fetch the references into a secondary library (with an optional search filter attached to the DOIs)
5. Remove all references in the original library (step 1) from the secondary library - this is to avoid seeing the same references twice
