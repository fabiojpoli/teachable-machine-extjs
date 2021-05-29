/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('TeachableMachine.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.main',
    data: {
        objectName: null,
        teachingProgress: 0,
        isDone: false,
        result: {}
    }
});