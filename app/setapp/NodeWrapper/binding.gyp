{
  "variables": {
    "module_name": "setapp",
    "module_path": "./lib/binding",
    "setapp_libs_path": "<!(node -e \"require('./scripts/include_dirs')\")",
  },
  "targets": [
    {
      "target_name": "<(module_name)",
      "sources": [
        "deps/setapp-lib-mapping.mm"
      ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "<(setapp_libs_path)",
      ],
      "xcode_settings": {
        "OTHER_LDFLAGS": ["-force_load <(setapp_libs_path)/libSetapp.a -framework Security -framework IOKit -framework QuartzCore -framework Cocoa"],
        'CLANG_CXX_LIBRARY': 'libc++',
        "MACOSX_DEPLOYMENT_TARGET":"10.10"
      }
    },
    {
      "target_name": "action_after_build",
      "type": "none",
      "dependencies": [
        "<(module_name)"
      ],
      "copies": [
        {
          "files": [ "<(PRODUCT_DIR)/<(module_name).node" ],
          "destination": "<(module_path)"
        }
      ]
    }
  ]
}
