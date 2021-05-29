/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend: 'TeachableMachine.Application',

    name: 'TeachableMachine',

    requires: [
        // This will automatically load all classes in the TeachableMachine namespace
        // so that application classes do not need to require each other.
        'TeachableMachine.*'
    ],

    // The name of the initial view to create.
    mainView: 'TeachableMachine.view.main.Main'
});
