/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 */
Ext.define('TeachableMachine.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',

    onWebcamPainted(videoCmp) {
        // init things when video is totally rendered
        this.initLibs(videoCmp);
    },

    async initLibs(videoCmp) {
        const
            me = this,
            mainView = me.getView(),
            {
                media,
                ghost
            } = videoCmp;

        // force to remove video controls
        media.dom.removeAttribute('controls');  

        mainView.mask('Please wait... Make sure the browser is not blocking the webcam');

        me.knnClassifier = knnClassifier.create();
        // Load the model
        me.mobilenet = await mobilenet.load();
            
        // Create an object from Tensorflow.js data API which could capture image from the web camera as Tensor.
        me.webcam = await tf.data.webcam(media.dom);
        
        // Force to start the webcam video without initial ghost covering the video
        media.show();
        ghost.hide();
        videoCmp.play();

        // all ready, we can remove loading mask
        mainView.unmask();

        // monitor the webcam
        while (true) {
            // if there are result
            if (me.knnClassifier.getNumClasses() > 0) {
                const
                    img = await me.webcam.capture(),
                    // Get the activation from mobilenet from the webcam.
                    activation = me.mobilenet.infer(img, 'conv_preds'),
                    // Get the most likely class and confidence from the classifier module.
                    { label, confidences } = await me.knnClassifier.predictClass(activation);

                // save result to viewModel to interact to the view
                me.getViewModel().set('result', {
                    name: label,
                    confidence: Ext.Number.roundToPrecision(confidences[label], 2)
                });

                // Dispose the tensor to release the memory.
                img.dispose();
            }

            await tf.nextFrame();
        }
    },

    async addObjectExample(id) {
        // Capture an image from the web camera.
        const
            me = this,
            img = await me.webcam.capture(),
            // Get the intermediate activation of MobileNet 'conv_preds' and pass that to the KNN classifier.
            activation = me.mobilenet.infer(img, true);
        
        // Pass the intermediate activation to the classifier.
        me.knnClassifier.addExample(activation, id);
        
        // Dispose the tensor to release the memory.
        img.dispose();
    },

    onSaveHandler() {
        const
            me = this,
            vm = this.getViewModel();

        let progress;

        me._interval = Ext.interval(async () => {
            // if for any reason the view was destroyed, let's stop the progress interval
            if (me.getView().isDestroyed) {
                me.resetProgressInterval();
            }
            else {
                // increment progress to show on the bar
                progress = vm.get('teachingProgress');
                progress += 0.1;

                // if progress is 100%, stop interval and leave from the function
                if (progress > 1) {
                    me.resetProgressInterval();
                    return;
                }

                // show the new progress on the bar
                vm.set('teachingProgress', Ext.Number.roundToPrecision(progress, 2));

                // add object sample and save by its name
                await me.addObjectExample(vm.get('objectName'));
            }
        }, 100); // 100 ms to show some effect
    },

    destroy() {
        // reset interval when destroy the view/viewcontroller
        this.resetProgressInterval();        
        this.callParent();
    },

    onDoneHandler() {
        this.getViewModel().set('isDone', true);
    },

    addNewItemHandler() {
        // reset to back to new item mode
        this.getViewModel().set({
            objectName: null,
            teachingProgress: 0,
            isDone: false
        });
    },

    resetProgressInterval() {
        // reset our interval to not keep running
        this._interval = Ext.uninterval(this._interval);
    }
});