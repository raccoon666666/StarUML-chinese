/**
 * Grammar for PEG.js
 * Slot Expression Grammar
 * e.g.) << stereotype >> name : type = value
 */

start
    = stereotype:stereotype? _ visibility:visibility? _ name:identifier _ type:type? _ value:valueExpression?
    {
        var ast = { name: name };
        if (stereotype) { ast.stereotype = stereotype; }
        if (visibility) { ast.visibility = visibility; }
        if (type) { ast.type = type; }
        if (value) { ast.value = value; }
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

valueExpression
    = "=" _ value:identifier { return value; }

identifier
    = id:[ 0-9A-Za-z`!@$%^&*_|{};.?\-\[\]'"\u00a0-\ufff0]+ { return id.join(""); }

typeExpression
    = id:[ 0-9A-Za-z`!@$%^&*_|{}<>;.?\-\[\]'"\u00a0-\ufff0]+ { return id.join(""); }

_   // whitespace
    = [ \t\n\r]*
