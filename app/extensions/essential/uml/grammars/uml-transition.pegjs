/**
 * Grammar for PEG.js
 * Transition Expression Grammar
 * e.g.) triggers guard effect
 */

start
    = triggers:triggers? _ guard:guard? _ effect:effect?
    {
        var ast = {};
        if (triggers) { ast.triggers = triggers; }
        if (guard) { ast.guard = guard; }
        if (effect) { ast.effect = effect; }
        return ast;
    }

stereotype
    = "<<" _ id:identifier _ ">>" { return id; }

triggers
    = event:identifier _ "," _ events:triggers
    {
        var list = [ event ];
        if (events && events.length > 0) {
            for(var i = 0; i < events.length; i++) {
                list.push(events[i]);
            }
        }
        return list;
    }
    / event:identifier
    {
        return [ event ];
    }

guard
    = "[" _ guard:identifier _ "]" { return guard; }

effect
    = "/" _ effect:identifier { return effect; }

identifier
    = id:[ 0-9A-Za-z`!@$%^&*_|{};.?\-"\u00a0-\ufff0]+ { return id.join(""); }

_   // whitespace
    = [ \t\n\r]*
