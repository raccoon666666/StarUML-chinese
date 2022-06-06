/**
 * Grammar for PEG.js
 * ERD Column Expression Grammar
 * e.g.) name : type(length)
 */

start
    = _ name:identifier _ type:type?
    {
        var ast = { name: name };
        if (type) { ast.type = type; }
        return ast;
    }

type
    = ":" _ typeName:identifier _ typeSize:typeSize?
    {
        var ast = {};
        if (typeName) { ast.name = typeName; }
        if (typeSize) { ast.size = typeSize; }
        return ast;
    }

typeSize
    = "(" _ number:number _ ")"
    {
        return number;
    }


number
    = val:[0-9,.-:~]+ { return val.join(""); }

identifier
    = id:[ 0-9A-Za-z`!@$%^&*_|{};.?\[\]"\u00a0-\ufff0]+ { return id.join(""); }

_   // whitespace
    = [ \t\n\r]*
