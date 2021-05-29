/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting causes an instance of this class to be created and
 * added to the Viewport container.
 */
Ext.define('TeachableMachine.view.main.Main', {
    extend: 'Ext.Panel',
    xtype: 'app-main',
    controller: 'main',
    viewModel: 'main',
    titleAlign: 'center',
    title: 'Show an object or someone\'s face on the webcam, type the name for it and click on "SAVE" to start teaching to the machine.',
    bodyPadding: 20,
    layout: {
        type: 'vbox',
        align: 'center'
    },
    items: [{
        xtype: 'panel',
        width: 600,
        height: 400,
        items: {
            xtype: 'video',
            listeners: {
                painted: 'onWebcamPainted'
            }
        },
        bbar: [{
            xtype: 'textfield',
            label: 'Type the object/person name',
            flex: 1,
            bind: {
                value: '{objectName}',
                // hide if teaching is in progress
                hidden: '{teachingProgress > 0}'
            }
        },{
            iconCls: 'x-fa fa-check',
            text: 'Save',
            handler: 'onSaveHandler',
            bind: {
                // hide if teaching is in progress
                hidden: '{teachingProgress > 0}',
                // name is required
                disabled: '{!objectName}'
            }
        },{
            xtype: 'progress',
            flex: 1,
            hidden: true,
            bind: {
                text: 'Teaching object/person "{objectName}" to the machine... {teachingProgress * 100}%',
                value: '{teachingProgress}',
                // show progress bar only if is in progress
                hidden: '{!(teachingProgress > 0 && teachingProgress < 1)}'
            }
        },{
            iconCls: 'x-fa fa-plus',
            text: 'Add new item',
            hidden: true,
            bind: {
                // hide if teaching is in progress
                hidden: '{teachingProgress < 1}'
            },
            handler: 'addNewItemHandler'
        },{
            xtype: 'spacer',
            hidden: true,
            bind: {
                // hide if teaching is in progress or if it is working on mode to identify the object
                hidden: '{teachingProgress < 1 || isDone}'
            }
        },{
            iconCls: 'x-fa fa-check',
            text: 'Done',
            hidden: true,
            bind: {
                // hide if teaching is in progress or if it is working on mode to identify the object
                hidden: '{teachingProgress < 1 || isDone}'
            },
            handler: 'onDoneHandler'
        },{
            xtype: 'progress',
            shadow: true,
            flex: 1,
            hidden: true,
            bind: {
                text: 'This is {result.name}! I am {result.confidence * 100}% sure!',
                value: '{result.confidence}',
                // show if user decide not add more objects
                hidden: '{!isDone}'
            }
        }]
    }]
});