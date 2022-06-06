/**
 * Grammar for PEG.js
 * Operation Expression Grammar
 * e.g.) << stereotype >> +name (in param:type, out param:type): returnType
 */

start
    = stereotype:stereotype? _ visibility:visibility? _ name:identifier _ parameters:parameters? _ returnType:type? _ multi:multiplicity?
    {
        var ast = { name: name };
        if (stereotype) { ast.stereotype = stereotype; }
        if (visibility) { ast.visibility = visibility; }
        if (parameters) { ast.parameters = parameters; }
        if (returnType) { ast.returnType = returnType; }
        if (multi)      { ast.returnMultiplicity = multi; }
        return ast;
    }

stereotype
    = "<<" _ id:identifier _ ">>" { return id; }

visibility
    = "+" { return 'public'; }
    / "#" { return 'protected'; }
    / "-" { return 'private'; }
    / "~" { return 'package'; }

parameters
    = "(" _ params:paramList? _ ")" { return params; }

paramList
    = param:param _ "," _ params:paramList
    {
        var list = [ param ];
        if (params && params.length > 0) {
            for(var i = 0; i < params.length; i++) {
                list.push(params[i]);
            }
        }
        return list;
    }
    / param:param
    {
        return [ param ];
    }

param
    = direction:direction? _ name:identifier _ type:type? _ multi:multiplicity? _ defaultValue:defaultValue?
    {
        var ast = { name: name };
        if (direction) { ast.direction = direction; }
        if (type) { ast.type = type; }
        if (multi) { ast.multiplicity = multi; }
        if (defaultValue) { ast.defaultValue = defaultValue; }
        return ast;
    }

direction
    = "in" __    { return "in"; }
    / "out" __   { return "out"; }
    / "inout" __ { return "inout"; }

type
    = ":" _ type:typeExpression { return type; }

defaultValue
    = "=" _ value:identifier { return value; }

typeExpression
    = id:[ 0-9A-Za-z`!@$%^&*_|{}<>;.?\-"\u00a0-\ufff0]+ { return id.join(""); }

identifier
    = id:[ 0-9A-Za-z`!@$%^&*_|{};.?\-\[\]"\u00a0-\ufff0]+ { return id.join(""); }

multiplicity
    = "[" _ multi:multiplicityExpression? _ "]"
    {
        if (multi) { return multi; }
    }

multiplicityExpression
    = id:[0-9.\*]+ { return id.join(""); }

_   // whitespace
    = [ \t\n\r]*

__
    = [ \t\n\r]+
