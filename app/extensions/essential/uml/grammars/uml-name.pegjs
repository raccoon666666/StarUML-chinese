/**
 * Grammar for PEG.js
 * General Expression Grammar
 * e.g.) << stereotype >> name
 */

start
    = stereotype:stereotype? _ visibility:visibility? _ name:identifier _
    {
        var ast = { name: name };
        if (stereotype) { ast.stereotype = stereotype; }
        if (visibility) { ast.visibility = visibility; }
        return ast;
    }

stereotype
    = "<<" _ id:identifier _ ">>" { return id; }

visibility
    = "+" { return 'public'; }
    / "#" { return 'protected'; }
    / "-" { return 'private'; }
    / "~" { return 'package'; }

identifier
    = id:[ 0-9A-Za-z`!@$%^&*_|{};.?\-\[\]'"\u00a0-\ufff0]+ { return id.join(""); }

_   // whitespace
    = [ \t\n\r]*
