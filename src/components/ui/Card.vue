<template>
    <div :class="cardClasses">
        <div v-if="$slots.header || title" class="card-header">
            <slot name="header">
                <h3 v-if="title" class="card-title">{{ title }}</h3>
            </slot>
        </div>

        <div class="card-body" :class="{ 'no-padding': noPadding }">
            <slot></slot>
        </div>

        <div v-if="$slots.footer" class="card-footer">
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

// Props 定義
const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    shadow: {
        type: Boolean,
        default: true
    },
    hover: {
        type: Boolean,
        default: false
    },
    noPadding: {
        type: Boolean,
        default: false
    },
    variant: {
        type: String,
        default: 'default',
        validator: (value) => ['default', 'primary', 'success', 'warning', 'danger'].includes(value)
    }
})

// 計算卡片樣式類別
const cardClasses = computed(() => {
    const classes = ['card']

    if (props.shadow) {
        classes.push('card-shadow')
    }

    if (props.hover) {
        classes.push('card-hover')
    }

    if (props.variant !== 'default') {
        classes.push(`card-${props.variant}`)
    }

    return classes
})
</script>

<style scoped>
.card-title {
    margin: 0;
    font-size: var(--font-lg);
    font-weight: 600;
    color: var(--text-primary);
}

.card-body.no-padding {
    padding: 0;
}

.card-hover {
    cursor: pointer;
    transition: all var(--transition-normal);
}

.card-hover:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.card-primary {
    border-color: var(--primary-color);
}

.card-primary .card-header {
    background-color: var(--primary-color);
    color: var(--secondary-color);
}

.card-success {
    border-color: var(--success-color);
}

.card-success .card-header {
    background-color: var(--success-color);
    color: white;
}

.card-warning {
    border-color: var(--warning-color);
}

.card-warning .card-header {
    background-color: var(--warning-color);
    color: white;
}

.card-danger {
    border-color: var(--danger-color);
}

.card-danger .card-header {
    background-color: var(--danger-color);
    color: white;
}
</style>
