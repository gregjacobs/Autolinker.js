load("@aspect_rules_esbuild//esbuild:defs.bzl", "esbuild")
load("@aspect_rules_js//js:defs.bzl", "js_library")
load(":ts-declarations.bzl", "ts_declarations")
load(":rollup-declarations-bundle.bzl", "rollup_declarations_bundle")

def ts_bundle(
    name,
    entry_point,
    root_dir,
    srcs,
    tsconfig_target,
    tsconfig_file_path,
    out_js,
    out_js_map,
    out_dts,
    format,
    deps = [],
    target = "esnext",
    platform = "node",
):
    """
    Compiles TypeScript and bundles the output into a single .js / .d.ts files.

    Supports building to .mjs and .cjs.

    Args:
      name: The name of the target to generate.
      entry_point: The TypeScript file which acts as the entry point for the 
        program (i.e. the file that imports/exports all of the other files)
      root_dir: The root directory where the source files sit.
      srcs: The source files (.ts) for the program to compile.
      tsconfig_target: The name of the ts_config() target for the tsconfig.json 
        file.
      tsconfig_file_path: The path to the tsconfig.json file to use for 
        compilation. This is used to create an on-the-fly extension of this 
        tsconfig.json file for use in this macro.
      out_js: The output path for the .js file. Example: 'esm/index.mjs'
      out_js_map: The output path for the .js.map file. Example: 'esm/index.mjs.map'
      out_dts: The output path for the .d.ts file. Example: 'esm/index.d.ts'
      format: The output module format. Likely 'mjs' or 'cjs'.
      deps: Any dependencies for TypeScript compilation.
      target: The target EcmaScript version. Example: 'es2022'. 
        See https://esbuild.github.io/api/#target for reference.
      platform: The platform ('browser', 'node', or 'neutral') to build for. 
        See: https://esbuild.github.io/api/#platform
    """
    js_bundle_target = name + "_bundle"
    declarations_bundle_target = name + "_declarations_bundle"
    declarations_target = name + "_declarations"
    declarations_tmp_output_dir = name + "-declarations" # temporary directory for individual .d.ts files output before we roll up the .d.ts files

    js_library(
        name = name,
        srcs = [
            ":" + js_bundle_target,
            ":" + declarations_bundle_target
        ],
        deps = deps,
    )

    # Create a .js bundle
    esbuild(
        name = js_bundle_target,
        visibility = ["//visibility:private"],
        entry_point = entry_point,
        srcs = srcs,
        tsconfig = tsconfig_target,
        output = out_js,
        #output_map = out_js_map,
        sourcemap = "linked",
        format = format,
        target = target,
        platform = platform,
    )

    # Create a .d.ts bundle
    declarations_entry_point = entry_point \
        .replace(root_dir, declarations_tmp_output_dir) \
        .removesuffix('.ts') \
        + '.d.ts'

    rollup_declarations_bundle(
        name = declarations_bundle_target,
        srcs = [
            ":" + declarations_target
        ],
        entry_point = declarations_entry_point,
        out = out_dts,
    )

    # Create the .d.ts files
    ts_declarations(
        name = declarations_target,
        srcs = srcs,
        root_dir = root_dir,
        out_dir = declarations_tmp_output_dir,
        tsconfig_target = tsconfig_target,
        tsconfig_file_path = tsconfig_file_path,
        target = target,
        module = "esnext" if format == "esm" else "commonjs"
    )
    