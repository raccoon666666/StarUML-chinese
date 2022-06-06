/**
 * Grammar for PEG.js
 * Lifeline Expression Grammar
 * e.g.) << stereotype >> name [selector] : type
 */

start
    = stereotype:stereotype? _ visibility:visibility? _ name:identifier _ selector:selector? _ type:type?
    {
        var ast = { name: name };
        if (stereotype) { ast.stereotype = stereotype; }
        if (visibility) { ast.visibility = visibility; }
        if (selector) { ast.selector = selector; }
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

selector
    = "[" _ sel:identifier _ "]" { return sel; }

type
    = ":" _ type:typeExpression { return type; }

typeExpression
    = id:[ 0-9A-Za-z`!@$%^&*_|{}<>;.?\-\[\]'"\u00a0-\ufff0]+ { return id.join(""); }

identifier
    = id:[ 0-9A-Za-z`!@$%^&*_|{};.?\-'"\u00a0-\ufff0]+ { return id.join(""); }

_   // whitespace
    = [ \t\n\r]*
