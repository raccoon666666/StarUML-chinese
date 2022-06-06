/**
 * Grammar for PEG.js
 * Object Expression Grammar
 * e.g.) << stereotype >> name : type
 */

start
    = stereotype:stereotype? _ visibility:visibility? _ name:identifier? _ type:type?
    {
        var ast = { name: name };
        if (stereotype) { ast.stereotype = stereotype; }
        if (visibility) { ast.visibility = visibility; }
        if (type) { ast.type = type; }
        return ast;
    }

stereotype
    = "<<" _ id:identifier _ ">>" { return id; }

visibility
    = "+" { return 'public'; }
    / "#" { return 'protected'; }
    / "-" { return 'private'; }
    / "~" { return 'package'; }

type
    = ":" _ type:typeExpression { return type; }

typeExpression
    = id:[ 0-9A-Za-z`!@$%^&*_|{}<>;.?\-\[\]'"\u00a0-\ufff0]+ { return id.join(""); }

identifier
    = id:[ 0-9A-Za-z`!@$%^&*_|{};.?\-\[\]'"\u00a0-\ufff0]+ { return id.join(""); }

_   // whitespace
    = [ \t\n\r]*
