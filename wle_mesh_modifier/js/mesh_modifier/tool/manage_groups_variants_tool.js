ManageGroupsVariantsTool = class ManageGroupsVariantsTool extends VertexTool {
    constructor(toolData, manageGroups = false, manageVariants = false) {
        super(toolData);

        this._myManageGroups = manageGroups;
        this._myManageVariants = manageVariants;

        this._myScrollEnabled = true;

        this._myGroupSavedCallbacks = new Map();
        this._myEditVariantCallbacks = new Map();
    }

    start() {
        super.start();

        if (this._myToolData.mySelectedVertexGroup != null) {
            this._selectAllGroupVertex();
        }
    }

    update(dt) {
        super.update(dt);

        let axes = PP.myRightGamepad.getAxesInfo().getAxes();
        if (Math.abs(axes[0]) > 0.5 && !PP.myLeftGamepad.getButtonInfo(PP.ButtonType.SQUEEZE).isPressed()) {
            if (this._myScrollEnabled) {
                this._selectNextVariant(Math.pp_sign(axes[0]));

                this._myScrollEnabled = false;
            } else {
                this._myToolData.myMeshComponent.active = true;
            }
        } else {
            this._myScrollEnabled = true;
        }

        if (PP.myRightGamepad.getButtonInfo(PP.ButtonType.SQUEEZE).isPressEnd()) {
            this._myToolData.mySelectedVertexes = [];
            if (this._myToolData.mySelectedVertexGroup != null) {
                this._myToolData.mySelectedVertexGroup = null;
                this._myToolData.mySelectedVertexVariant = null;
            } else {
                this._selectGroup();
            }
        }

        if (PP.myRightGamepad.getButtonInfo(PP.ButtonType.BOTTOM_BUTTON).isPressEnd(2)) {
            this._resetGroupVertexes();
            this._myToolData.mySelectedVertexVariant = null;
        }

        if (PP.myRightGamepad.getButtonInfo(PP.ButtonType.BOTTOM_BUTTON).isPressEnd(3)) {
            this._resetAllVertexes();
            this._myToolData.mySelectedVertexVariant = null;
        }


        if (this._myManageGroups) {
            if (PP.myRightGamepad.getButtonInfo(PP.ButtonType.SELECT).isPressed()) {
                this._selectVertex();
            }

            if (PP.myRightGamepad.getButtonInfo(PP.ButtonType.TOP_BUTTON).isPressed()) {
                this._deselectVertex();
            }

            if (PP.myRightGamepad.getButtonInfo(PP.ButtonType.TOP_BUTTON).isPressEnd(2)) {
                if (this._myToolData.mySelectedVertexes.length > 0) {
                    this._myToolData.mySelectedVertexes = [];
                } else {
                    this._selectAllGroupVertex();
                }
            }

            if (PP.myLeftGamepad.getButtonInfo(PP.ButtonType.BOTTOM_BUTTON).isPressEnd(2)) {
                this._saveGroup();
            }

            if (PP.myLeftGamepad.getButtonInfo(PP.ButtonType.SELECT).isPressEnd(2)) {
                this._deleteGroup();
            }
        }

        if (this._myManageVariants) {
            if (PP.myLeftGamepad.getButtonInfo(PP.ButtonType.TOP_BUTTON).isPressEnd(2)) {
                this._goToEditVariant();
            }

            if (PP.myLeftGamepad.getButtonInfo(PP.ButtonType.BOTTOM_BUTTON).isPressEnd(2)) {
                this._goToCreateVariant();
            }

            if (PP.myLeftGamepad.getButtonInfo(PP.ButtonType.SELECT).isPressEnd(2)) {
                this._deleteVariant();
            }
        }

        this._debugDraw();
    }

    _setupControlScheme() {
        let leftScheme = this._myToolData.myLeftControlScheme;
        let rightScheme = this._myToolData.myRightControlScheme;

        leftScheme.setSqueezeText("Hold: Enable Locomotion");
        leftScheme.setThumbstickText("x2: Download Configuration\nLeft/Right: Change Tool");

        rightScheme.setSqueezeText("Select/Deselect Group");
        rightScheme.setThumbstickText("x1: Toggle Control Scheme\nLeft/Right: Change Current Group Variant");

        if (this._myManageVariants) {
            leftScheme.setSelectText("x2: Delete Variant");
            leftScheme.setBottomButtonText("x2 Create Variant");
            leftScheme.setTopButtonText("x2 Edit Variant");

            rightScheme.setSelectText("");
            rightScheme.setTopButtonText("");
            rightScheme.setBottomButtonText("x2: Reset Group Vertexes\n x3: Reset All Vertexes");
        }

        if (this._myManageGroups) {
            leftScheme.setSelectText("x2: Delete Group");
            leftScheme.setBottomButtonText("x2 Save Group");
            leftScheme.setTopButtonText("");

            rightScheme.setSelectText("Select Vertex");
            rightScheme.setTopButtonText("x1: Deselect Vertex\n x2: Select/Deselect Group Vertexes");
            rightScheme.setBottomButtonText("x1: Reset Vertex\n x2: Reset Group Vertexes\n x3: Reset All Vertexes");
        }
    }

    _debugDraw() {
        if (this._myToolData.mySelectedVertexGroup == null) {
            this._myToolData.myVertexGroupConfig.debugDraw(this._myToolData.myMeshComponent);
        } else {
            this._myToolData.mySelectedVertexGroup.debugDraw(this._myToolData.myMeshComponent);
        }

        if (this._myManageGroups) {
            let color = null;
            if (this._myToolData.mySelectedVertexGroup != null) {
                color = randomColor(this._myToolData.mySelectedVertexGroup.getID());
            }
            for (let selectedVertex of this._myToolData.mySelectedVertexes) {
                selectedVertex.debugDraw(color);
            }
        }
    }

    registerGroupSavedEventListener(id, callback) {
        this._myGroupSavedCallbacks.set(id, callback);
    }

    unregisterGroupSavedEventListener(id) {
        this._myGroupSavedCallbacks.delete(id);
    }

    registerEditVariantEventListener(id, callback) {
        this._myEditVariantCallbacks.set(id, callback);
    }

    unregisterEditVariantEventListener(id) {
        this._myEditVariantCallbacks.delete(id);
    }
};