/* See license.txt for terms of usage */

// ********************************************************************************************* //
// Module

define([
    "firebug/lib/object",
    "firebug/firebug",
    "firebug/lib/tool",
    "firebug/debugger/debuggerClient",
    "arch/compilationunit"
],
function (Obj, Firebug, Tool, DebuggerClient, CompilationUnit) {

// ********************************************************************************************* //
// Debugger Tool

var DebuggerTool = Obj.extend(new Firebug.EventSource(),
{
    dispatchName: "JSD2.DebuggerTool",

    toolName: "debugger",

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Connection

    onConnect: function(context, connection)
    {
        if (FBTrace.DBG_BTI)
            FBTrace.sysout("bti.DebuggerTool.onConnect;");

        if (context.debuggerClient)
        {
            if (FBTrace.DBG_ERRORS)
                FBTrace.sysout("bti.DebuggerTool; ERROR debugger tool already registered");
            return;
        }

        var self = this;

        // Attach the debugger.
        context.debuggerClient = new DebuggerClient(context, connection);
        context.debuggerClient.attach(function(activeThread)
        {
            activeThread.addListener(self);

            FBTrace.sysout("DebuggerTool.onConnect; Debugger attached");
        });
    },

    onDisconnect: function(context, connection)
    {
        if (context.debuggerClient)
        {
            context.debuggerClient.detach(function(activeThread)
            {
                activeThread.removeListener(this);

                FBTrace.sysout("DebuggerTool.onDisconnect; Debugger detached");
            });
        }
    },

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Breakpoints

    setBreakpoint: function(context, url, lineNumber, callback)
    {
        return context.debuggerClient.activeThread.setBreakpoint({
            url: url,
            line: lineNumber
        }, callback);
    },

    clearBreakpoint: function(context, url, lineNumber)
    {
        // This is more correct, but bypasses Debugger
        //JSDebugger.fbs.clearBreakpoint(url, lineNumber);
    },

    enableBreakpoint: function(context, url, lineNumber)
    {
        //JSDebugger.fbs.enableBreakpoint(url, lineNumber);
    },

    disableBreakpoint: function(context, url, lineNumber)
    {
        //JSDebugger.fbs.disableBreakpoint(url, lineNumber);
    },

    isBreakpointDisabled: function(context, url, lineNumber)
    {
        //return JSDebugger.fbs.isBreakpointDisabled(url, lineNumber);
    },

    getBreakpointCondition: function(context, url, lineNumber)
    {
        //return JSDebugger.fbs.getBreakpointCondition(url, lineNumber);
    },

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Debugging

    rerun: function(context)
    {
    },

    resume: function(contex, callback)
    {
        return context.debuggerClient.activeThread.resume(callback);
    },

    stepOver: function(context, callback)
    {
        return context.debuggerClient.activeThread.stepOver(callback);
    },

    stepInto: function(context, callback)
    {
        return context.debuggerClient.activeThread.stepIn(callback);
    },

    stepOut: function(context, callback)
    {
        return context.debuggerClient.activeThread.stepOut(callback);
    },

    runUntil: function(context, compilationUnit, lineNumber, callback)
    {
    },

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Thread Listener

    paused: function(context, packet)
    {
        FBTrace.sysout("debuggerTool.paused; why: " + packet.why.type, packet);

        // @hack: shouldn't be only for breakpoints
        if (packet.why.type == "breakpoint")
            this.dispatch("onStartDebugging", [context, packet.frame]);
    }
});

// ********************************************************************************************* //
// Registration

Firebug.registerTool(DebuggerTool);

return DebuggerTool;

// ********************************************************************************************* //
});