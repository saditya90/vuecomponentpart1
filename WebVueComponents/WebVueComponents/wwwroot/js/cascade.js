'use strict';

/********* Cascade Dropdown Component *********
*
* Bootstrap Dropdown - https://getbootstrap.com/docs/4.0/components/forms/#form-controls
*
* <---Mandatory parameter--->
*
*  options - an object which will hold multiple properties value; for reference check Cascade.cshtml
*/
Vue.component('v-cascade-dropdown', {
    data: function () {
        return {
            parentId: '',
            parentLabel: 'Parent Label',
            parentDefaultOption: 'Choose Parent...',
            parentApiUrl: '',
            childId: '',
            childLabel: 'Child Label',
            childDefaultOption: 'Choose Child...',
            childApiUrl: '',
            parentData: [],
            childData: [],
            isCascadeDisabled: true,
            isServerSide: true,
            parentElementId: null,
            childElementId: null
        }
    },
    props: ['options'],
    methods: {
        parentChange: function () {
            let vm = this; vm.childId = ''; vm.childData.length = 0;
            vm.isCascadeDisabled = !(vm.parentId !== '');
            if (!vm.isCascadeDisabled) {
                if (vm.isServerSide)
                    $.ajax({ url: vm.childApiUrl, method: 'POST', data: { id: vm.parentId }, success: function (r) { vm.childData = r; } });
                else
                    vm.childData = vm.options.childData.filter(function (v) { return v.parentId == vm.parentId });
            }
            vm.$emit('parent-changed', vm.parentId);
        },
        childChange: function () {
            let vm = this;
            vm.$emit('child-changed', vm.childId)
        },
        controlId: function () {
            return getUniqueId();
        }
    },
    mounted: function () {
        let vm = this;
        vm.parentElementId = vm.controlId();
        vm.childElementId = vm.controlId();
        vm.parentApiUrl = vm.options != undefined ? (vm.options.parentUrl || '') : '';
        if (vm.options != undefined && vm.options.isServerSide != undefined)
            vm.isServerSide = vm.options.isServerSide;
        vm.childApiUrl = vm.options != undefined ? (vm.options.childUrl || '') : '';
        vm.parentLabel = vm.options != undefined ? (vm.options.parentLabel || vm.parentLabel) : vm.parentLabel;
        vm.parentDefaultOption = vm.options != undefined ? (vm.options.parentDefaultOption || vm.parentDefaultOption) : vm.parentDefaultOption;
        vm.childLabel = vm.options != undefined ? (vm.options.childLabel || vm.childLabel) : vm.childLabel;
        vm.childDefaultOption = vm.options != undefined ? (vm.options.childDefaultOption || vm.childDefaultOption) : vm.childDefaultOption;
        if (vm.isServerSide)
            $.ajax({ url: vm.parentApiUrl, method: 'GET', success: function (r) { vm.parentData = r; } });
        else {
            vm.parentData = vm.options != undefined ? (vm.options.parentData || []) : [];
        }
    },
    template: `<div class="form-row">
                    <div class="form-group col-md-6">
                      <label :for="parentElementId">{{parentLabel}}</label>
                      <select :id="parentElementId" class="form-control" v-model="parentId" v-on:change="parentChange">
                        <option value="">{{parentDefaultOption}}</option>
                        <option v-for="item in parentData" :value="item.id">{{item.name}}</option>
                      </select>
                    </div>
                    <div class="form-group col-md-6">
                      <label :for="childElementId">{{childLabel}}</label>
                      <select :id="childElementId" class="form-control" v-model="childId" v-on:change="childChange" v-bind:disabled="isCascadeDisabled">
                        <option value="">{{childDefaultOption}}</option>
                        <option v-for="item in childData" :value="item.id">{{item.name}}</option>
                      </select>
                    </div>
                  </div>`
});