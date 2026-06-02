/**
 * Side-effect entry for mashlib: registers header + design-system provider once.
 * Both mashlib import paths alias to this bundle so webpack dedupes the graph.
 */
import '../v2/components/layout/header/index'
import '../design-system/components/provider/index'
