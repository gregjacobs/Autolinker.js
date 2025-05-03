load("@npm//:rollup/package_json.bzl", rollup_bin = "bin")
load("@bazel_skylib//rules:write_file.bzl", "write_file")

def rollup_declarations_bundle(
    name,
    srcs,
    entry_point,
    out,
):
    """
    Given a set of .d.ts files (usually from tsc output), creates a single .d.ts file.

    Args:
      name: The name of the target.
      srcs: The source (input) files to rollup.
      entry_point: The file where we should start bundling from.
      out: The output filename. Ex: "index.d.ts"
    """
    rollup_config_target = name + "_rollup_config"
    rollup_config_filename = name + "-rollup-config.mjs"

    rollup_bin.rollup(
        name = name,
        srcs = srcs + [
            ":" + rollup_config_target,
            "//:node_modules/rollup-plugin-dts",
        ],
        outs = [out],
        args = [
            '--config', rollup_config_filename
        ]
    )

    write_file(
        name = rollup_config_target,
        out = rollup_config_filename,
        content = ["""
            import { dts } from "rollup-plugin-dts";

            const config = [
                {
                    input: "./%s",
                    output: [
                        { file: "%s", format: "es" }
                    ],
                    plugins: [dts()],
                },
            ];

            export default config;
        """ % (entry_point, out)]
    )