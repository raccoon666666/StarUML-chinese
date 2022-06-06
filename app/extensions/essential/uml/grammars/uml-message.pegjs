/**
 * Grammar for PEG.js
 * Message Expression Grammar
 * e.g.) << stereotype >> assignmentTarget = name (arguments)
 */

start
    = stereotype:stereotype? _ assignmentTarget:assignmentTarget? _ name:identifier _ args:arguments?
    {
        var ast = { name: name };
        if (stereotype) { ast.stereotype = stereotype; }
        if (assignmentTarget) { ast.assignmentTarget = assignmentTarget; }
        if (arguments) { ast.arguments = args; }
        return ast;
    }

stereotype
    = "<<" _ id:identifier _ ">>" { return id; }

assignmentTarget
    = target:identifier _ "=" { return target; }

arguments
    = "(" _ arg:identifier _ ")" { return arg; }

identifier
    = id:[ 0-9A-Za-z`!@$%^&*_|{};,.?\-\[\]"\u00a0-\ufff0]+ { return id.join(""); }

_   // whitespace
    = [ \t\n\r]*
