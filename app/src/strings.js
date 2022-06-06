/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/* eslint key-spacing: "off", quotes: "off" */

module.exports = {

  // Menus

  // Menus and Commands
  // File
  "CMD_FILE"                          : "文件",
  "CMD_FILE_NEW"                      : "新建",
  "CMD_FILE_NEW_FROM_TEMPLATE"        : "从模板新建",
  "CMD_FILE_OPEN"                     : "打开...",
  "CMD_FILE_OPEN_RECENT"              : "最近打开",
  "CMD_FILE_SAVE"                     : "保存",
  "CMD_FILE_SAVE_AS"                  : "另存为...",
  "CMD_FILE_IMPORT"                   : "导入",
  "CMD_FILE_IMPORT_FRAGMENT"          : "Fragment...",
  "CMD_FILE_EXPORT"                   : "导出",
  "CMD_FILE_EXPORT_FRAGMENT"          : "Fragment...",
  "CMD_FILE_CLOSE"                    : "关闭",
  "CMD_FILE_PREFERENCES"              : "首选项...",
  "CMD_FILE_PRINT_TO_PDF"             : "打印为PDF...",
  "CMD_QUIT"                          : "Quit",
  "CMD_EXIT"                          : "退出",
  // Edit
  "CMD_EDIT"                          : "编辑",
  "CMD_EDIT_UNDO"                     : "撤销",
  "CMD_EDIT_REDO"                     : "重复",
  "CMD_EDIT_CUT"                      : "剪切",
  "CMD_EDIT_COPY"                     : "复制",
  "CMD_EDIT_PASTE"                    : "粘贴",
  "CMD_EDIT_DELETE"                   : "删除",
  "CMD_EDIT_DELETE_FROM_MODEL"        : "Delete from Model",
  "CMD_EDIT_MOVE_UP"                  : "上移",
  "CMD_EDIT_MOVE_DOWN"                : "下移",
  "CMD_EDIT_SELECT_ALL"               : "全选",
  "CMD_EDIT_SELECT_IN_EXPLORER"       : "Select In Explorer",
  "CMD_EDIT_SELECT_IN_DIAGRAM"        : "Select In Diagram",
  // Format
  "CMD_FORMAT"                        : "格式",
  "CMD_FORMAT_FONT"                   : "Font...",
  "CMD_FORMAT_FILL_COLOR"             : "Fill Color...",
  "CMD_FORMAT_LINE_COLOR"             : "Line Color...",
  "CMD_FORMAT_LINE_STYLE"             : "Line Style",
  "CMD_FORMAT_LINE_STYLE_RECTILINEAR" : "Rectilinear",
  "CMD_FORMAT_LINE_STYLE_OBLIQUE"     : "Oblique",
  "CMD_FORMAT_LINE_STYLE_ROUNDRECT"   : "Rounded Rectilinear",
  "CMD_FORMAT_LINE_STYLE_CURVE"       : "Curve",

  "CMD_FORMAT_AUTO_RESIZE"            : "Auto Resize",
  "CMD_FORMAT_SHOW_SHADOW"            : "Show Shadow",
  // Model
  "CMD_MODEL"                         : "Model",
  // Tools
  "CMD_TOOLS"                         : "Tools",
  "CMD_TOOLS_EXTENSION_MANAGER"       : "Extension Manager...",
  // View
  "CMD_VIEW"                          : "View",
  "CMD_VIEW_CLOSE_DIAGRAM"            : "Close Diagram",
  "CMD_VIEW_CLOSE_OTHER_DIAGRAMS"     : "Close Other Diagrams",
  "CMD_VIEW_CLOSE_ALL_DIAGRAMS"       : "Close All Diagrams",
  "CMD_VIEW_NEXT_DIAGRAM"             : "Next Diagram",
  "CMD_VIEW_PREVIOUS_DIAGRAM"         : "Previous Diagram",
  "CMD_VIEW_ZOOM_IN"                  : "Zoom In",
  "CMD_VIEW_ZOOM_OUT"                 : "Zoom Out",
  "CMD_VIEW_ACTUAL_SIZE"              : "Actual Size",
  "CMD_VIEW_FIT_TO_WINDOW"            : "Fit To Window",
  "CMD_VIEW_SHOW_GRID"                : "Show Grid",
  "CMD_VIEW_SHOW_SIDEBAR"             : "Show Sidebar",
  "CMD_VIEW_HIDE_SIDEBAR"             : "Hide Sidebar",
  "CMD_VIEW_SHOW_NAVIGATOR"           : "Show Navigator",
  "CMD_VIEW_HIDE_NAVIGATOR"           : "Hide Navigator",
  "CMD_VIEW_SHOW_TOOLBAR"             : "Show Toolbar",
  "CMD_VIEW_HIDE_TOOLBAR"             : "Hide Toolbar",
  "CMD_VIEW_SHOW_STATUSBAR"           : "Show Status Bar",
  "CMD_VIEW_HIDE_STATUSBAR"           : "Hide Status Bar",
  "CMD_VIEW_SHOW_TOOLBOX"             : "Show Toolbox",
  "CMD_VIEW_HIDE_TOOLBOX"             : "Hide Toolbox",
  "CMD_VIEW_SHOW_EDITORS"             : "Show Editors",
  "CMD_VIEW_HIDE_EDITORS"             : "Hide Editors",
  // Help
  "CMD_HELP"                          : "帮助",
  "CMD_HELP_ABOUT"                    : "关于 StarUML",
  "CMD_HELP_CHECK_FOR_UPDATES"        : "Check for Updates...",
  "CMD_HELP_ENTER_LICENSE"            : "Enter License...",
  "CMD_HELP_DOCUMENTATION"            : "Documentation",
  "CMD_HELP_FORUM"                    : "Forum",
  "CMD_HELP_RELEASE_NOTE"             : "Release Notes",
  "CMD_HELP_REQUEST_FEATURE"          : "Request Feature",

  // UML Commands
  /* File: New From Template */
  "CMD_FILE_NEW_FROM_TEMPLATE_UML_MINIMAL"      : "UML Minimal",
  "CMD_FILE_NEW_FROM_TEMPLATE_UML_CONVENTIONAL" : "UML Conventional",
  "CMD_FILE_NEW_FROM_TEMPLATE_4P1VIEWMODEL"     : "4+1 View Model",
  "CMD_FILE_NEW_FROM_TEMPLATE_RATIONAL"         : "Rational",
  // Model: Profiles
  "CMD_MODEL_APPLY_PROFILE"                  : "Apply Profile",
  "CMD_MODEL_APPLY_PROFILE_UML_STANDARD"     : "UML Standard Profile (v2)",
  // Model Add
  "CMD_MODEL_ADD"                            : "添加",
  "CMD_MODEL_ADD_DIAGRAM"                    : "添加图",
  // Model: Packages
  "CMD_MODEL_ADD_MODEL"                      : "模型",
  "CMD_MODEL_ADD_SUBSYSTEM"                  : "子系统",
  "CMD_MODEL_ADD_PACKAGE"                    : "包",
  "CMD_MODEL_ADD_PROFILE"                    : "配置文件",
  // Model: Classes
  "CMD_MODEL_ADD_CLASS"                      : "类",
  "CMD_MODEL_ADD_INTERFACE"                  : "接口",
  "CMD_MODEL_ADD_SIGNAL"                     : "信号",
  "CMD_MODEL_ADD_DATATYPE"                   : "数据类型",
  "CMD_MODEL_ADD_PRIMITIVETYPE"              : "原始类型",
  "CMD_MODEL_ADD_ENUMERATION"                : "枚举",
  "CMD_MODEL_ADD_ARTIFACT"                   : "Artifact",
  "CMD_MODEL_ADD_COMPONENT"                  : "组件",
  "CMD_MODEL_ADD_NODE"                       : "Node",
  "CMD_MODEL_ADD_USECASE"                    : "UseCase",
  "CMD_MODEL_ADD_ACTOR"                      : "Actor",
  "CMD_MODEL_ADD_STEREOTYPE"                 : "Stereotype",
  // Model: Instances
  "CMD_MODEL_ADD_OBJECT"                     : "Object",
  "CMD_MODEL_ADD_ARTIFACTINSTANCE"           : "Artifact Instance",
  "CMD_MODEL_ADD_COMPONENTINSTANCE"          : "Component Instance",
  "CMD_MODEL_ADD_NODEINSTANCE"               : "Node Instance",
  // Model: Behaviors
  "CMD_MODEL_ADD_COLLABORATION"              : "Collaboration",
  "CMD_MODEL_ADD_INTERACTION"                : "Interaction",
  "CMD_MODEL_ADD_STATEMACHINE"               : "State Machine",
  "CMD_MODEL_ADD_ACTIVITY"                   : "Activity",
  "CMD_MODEL_ADD_OPAQUEBEHAVIOR"             : "Opaque Behavior",
  // Model: Features
  "CMD_MODEL_ADD_TEMPLATEPARAMETER"          : "Template Parameter",
  "CMD_MODEL_ADD_PARAMETER"                  : "Parameter",
  "CMD_MODEL_ADD_ENUMERATIONLITERAL"         : "Enumeration Literal",
  "CMD_MODEL_ADD_ATTRIBUTE"                  : "Attribute",
  "CMD_MODEL_ADD_PORT"                       : "Port",
  "CMD_MODEL_ADD_OPERATION"                  : "Operation",
  "CMD_MODEL_ADD_RECEPTION"                  : "Reception",
  "CMD_MODEL_ADD_EXTENSIONPOINT"             : "Extension Point",
  "CMD_MODEL_ADD_SLOT"                       : "Slot",
  // Model: States
  "CMD_MODEL_ADD_STATE"                      : "State",
  "CMD_MODEL_ADD_REGION"                     : "Region",
  "CMD_MODEL_ADD_ENTRY_ACTIVITY"             : "Entry Activity",
  "CMD_MODEL_ADD_DO_ACTIVITY"                : "Do Activity",
  "CMD_MODEL_ADD_EXIT_ACTIVITY"              : "Exit Activity",
  "CMD_MODEL_ADD_TRIGGER"                    : "Trigger",
  "CMD_MODEL_ADD_EFFECT"                     : "Effect",
  // Model: Actions
  "CMD_MODEL_ADD_ACTION"                     : "Action",
  // Model: Common
  "CMD_MODEL_ADD_CONSTRAINT"                 : "Constraint",
  "CMD_MODEL_ADD_TAG"                        : "Tag",
  // Model: Diagrams
  "CMD_MODEL_ADD_DIAGRAM_CLASS"              : "类图",
  "CMD_MODEL_ADD_DIAGRAM_PACKAGE"            : "包图",
  "CMD_MODEL_ADD_DIAGRAM_OBJECT"             : "对象图",
  "CMD_MODEL_ADD_DIAGRAM_COMPOSITESTRUCTURE" : "组合结构图",
  "CMD_MODEL_ADD_DIAGRAM_COMPONENT"          : "组件图",
  "CMD_MODEL_ADD_DIAGRAM_DEPLOYMENT"         : "部署图",
  "CMD_MODEL_ADD_DIAGRAM_USECASE"            : "用例图",
  "CMD_MODEL_ADD_DIAGRAM_SEQUENCE"           : "时序图",
  "CMD_MODEL_ADD_DIAGRAM_COMMUNICATION"      : "通信图",
  "CMD_MODEL_ADD_DIAGRAM_STATECHART"         : "状态图",
  "CMD_MODEL_ADD_DIAGRAM_ACTIVITY"           : "活动图",
  "CMD_MODEL_ADD_DIAGRAM_PROFILE"            : "概要图",
  // Format
  "CMD_FORMAT_STEREOTYPE"                    : "Stereotype Display",
  "CMD_FORMAT_STEREOTYPE_NONE"               : "None",
  "CMD_FORMAT_STEREOTYPE_LABEL"              : "Label",
  "CMD_FORMAT_STEREOTYPE_DECORATION"         : "Decoration",
  "CMD_FORMAT_STEREOTYPE_DECORATION_LABEL"   : "Decoration with Label",
  "CMD_FORMAT_STEREOTYPE_ICON"               : "Icon",
  "CMD_FORMAT_STEREOTYPE_ICON_LABEL"         : "Icon with Label",
  "CMD_FORMAT_WORD_WRAP"                     : "Word Wrap",
  "CMD_FORMAT_SHOW_VISIBILITY"               : "Show Visibility",
  "CMD_FORMAT_SHOW_NAMESPACE"                : "Show Namespace",
  "CMD_FORMAT_SHOW_PROPERTY"                 : "Show Property",
  "CMD_FORMAT_SHOW_TYPE"                     : "Show Type",
  "CMD_FORMAT_SHOW_MULTIPLICITY"             : "Show Multiplicity",
  "CMD_FORMAT_SHOW_OPERATION_SIGNATURE"      : "Show Operation Signature",
  "CMD_FORMAT_SUPPRESS_ATTRIBUTES"           : "Suppress Attributes",
  "CMD_FORMAT_SUPPRESS_OPERATIONS"           : "Suppress Operations",
  "CMD_FORMAT_SUPPRESS_RECEPTIONS"           : "Suppress Receptions",
  "CMD_FORMAT_SUPPRESS_LITERALS"             : "Suppress Literals",

  // Extension Manager
  "EXTENSION_NOT_INSTALLED"              : "Couldn't remove extension {0} because it wasn't installed.",
  "CANT_UPDATE"                          : "The update isn't compatible with this version of StarUML.",
  "CANT_UPDATE_DEV"                      : "Extensions in the \"dev\" folder can't be updated automatically.",
  "INSTALL"                              : "Install",
  "UPDATE"                               : "Update",
  "REMOVE"                               : "Remove",
  "OVERWRITE"                            : "Overwrite",
  "RELOAD"                               : "Reload",
  "EXTENSION_MANAGER_ERROR_LOAD"         : "Unable to access the extension registry. Please try again later.",
  "EXTENSION_INCOMPATIBLE_NEWER"         : "This extension requires a newer version of StarUML.",
  "EXTENSION_INCOMPATIBLE_OLDER"         : "This extension currently only works with older versions of StarUML.",
  "EXTENSION_LATEST_INCOMPATIBLE_NEWER"  : "Version {0} of this extension requires a newer version of StarUML. But you can install the earlier version {1}.",
  "EXTENSION_LATEST_INCOMPATIBLE_OLDER"  : "Version {0} of this extension only works with older versions of StarUML. But you can install the earlier version {1}.",
  "EXTENSION_NO_DESCRIPTION"             : "No description",
  "EXTENSION_ISSUES"                     : "Issues",
  "EXTENSION_MORE_INFO"                  : "More info...",
  "EXTENSION_ERROR"                      : "Extension error",
  "EXTENSION_KEYWORDS"                   : "Keywords",
  "EXTENSION_INSTALLED"                  : "Installed",
  "EXTENSION_UPDATE_INSTALLED"           : "This extension update has been downloaded and will be installed after StarUML reloads.",
  "EXTENSION_MANAGER_REMOVE"             : "Remove Extension",
  "EXTENSION_MANAGER_REMOVE_ERROR"       : "Unable to remove one or more extensions: {0}. StarUML will still reload.",
  "EXTENSION_MANAGER_UPDATE"             : "Update Extension",
  "EXTENSION_MANAGER_UPDATE_ERROR"       : "Unable to update one or more extensions: {0}. StarUML will still reload.",
  "MARKED_FOR_REMOVAL"                   : "Marked for removal",
  "UNDO_REMOVE"                          : "Undo",
  "MARKED_FOR_UPDATE"                    : "Marked for update",
  "UNDO_UPDATE"                          : "Undo",
  "CHANGE_AND_RELOAD_TITLE"              : "Change Extensions",
  "CHANGE_AND_RELOAD_MESSAGE"            : "To update or remove the marked extensions, StarUML will need to reload. You'll be prompted to save unsaved changes.",
  "REMOVE_AND_RELOAD"                    : "Remove Extensions and Reload",
  "CHANGE_AND_RELOAD"                    : "Change Extensions and Reload",
  "UPDATE_AND_RELOAD"                    : "Update Extensions and Reload",
  "PROCESSING_EXTENSIONS"                : "Processing extension changes\u2026",
  "NO_EXTENSIONS"                        : "No extensions installed yet.<br>Click on the Registry tab above to get started.",
  "NO_EXTENSION_MATCHES"                 : "No extensions match your search.",
  "REGISTRY_SANITY_CHECK_WARNING"        : "Be cautious when installing extensions from an unknown source.",
  "UNKNOWN_ERROR"                        : "Unknown internal error.",

  // Install Extension Dialog
  "INSTALL_EXTENSION_TITLE"              : "安装扩展",
  "UPDATE_EXTENSION_TITLE"               : "更新扩展",
  "INSTALLING_FROM"                      : "Installing extension from {0}\u2026",
  "INSTALL_SUCCEEDED"                    : "安装成功!",
  "INSTALL_FAILED"                       : "安装失败.",
  "INSTALL_CANCELED"                     : "取消安装.",
  "CANCELING_INSTALL"                    : "Canceling\u2026",
  "CANCELING_HUNG"                       : "Canceling the install is taking a long time. An internal error may have occurred.",

  // Dialogs
  "SAVE_CHANGES"                         : "保存更改",
  "SAVE_CHANGES_MESSAGE"                 : "你想要保存更改吗?",
  "SELECT_MODEL_FILE"                    : "选择一个模型文件...",
  "SELECT_MODEL_FRAGMENT_FILE"           : "选择要导入的模型片段...",
  "SELECT_ELEMENT_TO_EXPORT"             : "选择一个元素导出...",
  "EXPORT_MODEL_FRAGMENT"                : "导出模型片段",

  // Dialog Buttons
  "OK"                                   : "确定",
  "CANCEL"                               : "取消",
  "SAVE"                                 : "保存",
  "DONTSAVE"                             : "不保存",
  "CLOSE"                                : "关闭",
  "INSTALL_AND_RESTART"                  : "安装和启动",

  // Settings for Explorer
  "EXPLORER_SETTINGS_SORT_BY_ADDED"      : "按时间排序",
  "EXPLORER_SETTINGS_SORT_BY_NAME"       : "按名称排序",
  "EXPLORER_SETTINGS_SHOW_STEREOTYPE_TEXT" : "显示原型文本",

  // Keyboard modifier names
  "KEYBOARD_CTRL"   : "Ctrl",
  "KEYBOARD_SHIFT"  : "Shift",
  "KEYBOARD_SPACE"  : "Space"

}
