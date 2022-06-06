/**
 * Grammar for PEG.js
 * Attribute Expression Grammar
 * e.g.) << stereotype >> name : type [ multiplicity ] = defaultValue
 */

start
    = stereotype:stereotype? _ visibility:visibility? _ name:identifier _ type:type? _ multi:multiplicity? _ value:defaultValue?
    {
        var ast = { name: name };
        if (stereotype) { ast.stereotype = stereotype; }
        if (visibility) { ast.visibility = visibility; }
        if (type) { ast.type = type; }
        if (multi) { ast.multiplicity = multi; }
        if (value) { ast.defaultValue = value; }
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

defaultValue
    = "=" _ value:identifier { return value; }

identifier
    = id:[ 0-9A-Za-z`!@$%^&*_|{};.?\-\[\]"\u00a0-\ufff0]+ { return id.join(""); }

typeExpression
    = id:[ 0-9A-Za-z`!@$%^&*_|{}<>;.?\-"\u00a0-\ufff0]+ { return id.join(""); }

multiplicity
    = "[" _ multi:multiplicityExpression? _ "]"
    {
        if (multi) { return multi; }
    }

multiplicityExpression
    = id:[0-9.\*]+ { return id.join(""); }

_   // whitespace
    = [ \t\n\r]*
