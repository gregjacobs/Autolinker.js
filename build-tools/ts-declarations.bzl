load("@aspect_rules_ts//ts:defs.bzl", "ts_project", "ts_config")
load("@bazel_skylib//rules:write_file.bzl", "write_file")

def ts_declarations(
    name,
    srcs,
    root_dir,
    out_dir,
    tsconfig_target,
    tsconfig_file_path,
    target,
    module,
    visibility = ["//visibility:public"],
):
    """
    Generates rules to compile TypeScript declaration files (.d.ts files) from input sources.

    Args:
      name: The name of the target.
      root_dir: The root directory where the source files sit.
      out_dir: The output directory of where to write files.
      srcs: The source files (.ts) for the program to compile.
      tsconfig_target: The name of the ts_config() target for the tsconfig.json 
        file.
      tsconfig_file_path: The path to the tsconfig.json file to use for 
        compilation. This is used to create an on-the-fly extension of this 
        tsconfig.json file for use in this macro.
      target: The target EcmaScript version. Example: 'esnext' or 'es2022'. 
        See https://www.typescriptlang.org/tsconfig/#target.
      module: The output module format. Likely 'esnext' or 'commonjs'. 
        See https://www.typescriptlang.org/tsconfig/#module.
      visibility: Visibility for the generated target.
    """
    tsconfig_generated_target = name + "_tsconfig"
    tsconfig_generated_filename = name + "-tsconfig.json"

    ts_project(
        name = name,
        visibility = visibility,
        srcs = srcs,
        root_dir = root_dir,
        out_dir = out_dir,
        source_map = True,
        emit_declaration_only = True,
        declaration = True,
        declaration_map = True,
        tsconfig = tsconfig_generated_target,
    )

    ts_config(
        name = tsconfig_generated_target,
        visibility = ["//visibility:private"],
        src = tsconfig_generated_filename,
        deps = [tsconfig_target],
    )

    write_file(
        name = name + "_tsconfig_file",
        visibility = ["//visibility:private"],
        out = tsconfig_generated_filename,
        content = ["""
            {
                "extends": "./%s",
                "compilerOptions": {
                    "target": "%s",
                    "module": "%s",
                    "sourceMap": true,
                    "declarationMap": true,
                    "emitDeclarationOnly": true,
                    "noEmit": false,
                }
            }
        """ % (tsconfig_file_path, target, module)]
    )