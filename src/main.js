import { createApp } from 'vue'
import './style.css'
import App from './app.vue'
import i18n from "./i18n.js";
import PrimeVue from 'primevue/config';
import { definePreset } from '@primeuix/themes';
import Material from '@primeuix/themes/material';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import Tooltip from 'primevue/tooltip';
import {
    Button,
    Card,
    Checkbox,
    Column,
    ConfirmationService,
    ConfirmDialog,
    DataTable,
    Dialog,
    DialogService,
    Drawer,
    FloatLabel,
    IconField,
    InputIcon,
    InputNumber,
    InputText,
    Menu,
    Row,
    Select,
    SelectButton,
    Step,
    StepList,
    Stepper,
    Tag,
    Toast,
    Textarea,
    Timeline,
    ToastService,
    Toolbar
} from "primevue";
import router from "./router.js";
import pinia from "./pinia.js";

const primeUiLicenseKey = import.meta.env.VITE_PRIME_UI_LICENSE_KEY;

// Preset personalizado para Vigía (§4.1.1 Style Guide)
const VigiaPreset = definePreset(Material, {
    semantic: {
        primary: {
            50: '#F0F5FA',
            100: '#DBE7F2',
            200: '#BAD1E6',
            300: '#8CB4D4',
            400: '#5A92BF',
            500: '#1B3A5C', // Azul Vigía
            600: '#173250',
            700: '#132840',
            800: '#102134',
            900: '#0D1A29',
            950: '#070F19'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{primary.500}',
                    inverseColor: '#FFFFFF',
                    hoverColor: '#3D6B94', // Azul claro hover
                    activeColor: '#173250'
                }
            }
        }
    }
});

// noinspection JSCheckFunctionSignatures
createApp(App)
    .use(i18n)
    .use(PrimeVue, {
        theme: { preset: VigiaPreset },
        ripple: true,
        license: primeUiLicenseKey
    })
    .use(ConfirmationService)
    .use(DialogService)
    .use(ToastService)
    .component('pv-button',         Button)
    .component('pv-card',           Card)
    .component('pv-column',         Column)
    .component('pv-confirm-dialog', ConfirmDialog)
    .component('pv-checkbox',       Checkbox)
    .component('pv-data-table',     DataTable)
    .component('pv-dialog',         Dialog)
    .component('pv-select',         Select)
    .component('pv-select-button',  SelectButton)
    .component('pv-step',           Step)
    .component('pv-step-list',      StepList)
    .component('pv-stepper',        Stepper)
    .component('pv-float-label',    FloatLabel)
    .component('pv-icon-field',     IconField)
    .component('pv-input-icon',     InputIcon)
    .component('pv-input-text',     InputText)
    .component('pv-input-number',   InputNumber)
    .component('pv-menu',           Menu)
    .component('pv-row',            Row)
    .component('pv-drawer',         Drawer)
    .component('pv-tag',            Tag)
    .component('pv-textarea',       Textarea)
    .component('pv-timeline',       Timeline)
    .component('pv-toolbar',        Toolbar)
    .component('pv-toast',          Toast)
    .directive('tooltip',           Tooltip)
    .use(pinia)
    .use(router)
    .mount('#app')
