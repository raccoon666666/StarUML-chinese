/**
 * Grammar for PEG.js
 * TemplateParameter Expression Grammar
 * e.g.) << stereotype >> name : type = defaultValue
 */

start
    = stereotype:stereotype? _ name:identifier _ type:type? _ value:defaultValue?
    {
        var ast = { name: name };
        if (stereotype) { ast.stereotype = stereotype; }
        if (type) { ast.parameterType = type; }
        if (value) { ast.defaultValue = value; }
        return ast;
    }

stereotype
    = "<<" _ id:identifier _ ">>" { return id; }

type
    = ":" _ type:typeExpression { return type; }

defaultValue
    = "=" _ value:identifier { return value; }

typeExpression
    = id:[ 0-9A-Za-z`!@$%^&*_|{}<>;.?\-\[\]"\u00a0-\ufff0]+ { return id.join(""); }

identifier
    = id:[ 0-9A-Za-z`!@$%^&*_|{};.?\-\[\]"\u00a0-\ufff0]+ { return id.join(""); }

_   // whitespace
    = [ \t\n\r]*
