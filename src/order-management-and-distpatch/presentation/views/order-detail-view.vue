<script setup>
import { computed, onMounted, ref } from 'vue';
import Timeline from 'primevue/timeline';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useOrderStore } from '../../application/order.store.js';
import { ORDER_STATUS, orderStatusSeverity, orderPrioritySeverity } from '../../domain/order-status.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();

const feedback = ref('');

onMounted(() => {
  if (!orderStore.orders.length) {
    orderStore.loadOrders();
  }
});

const order = computed(() => orderStore.getOrderById(route.params.id));

async function decide(newStatus, noteKey) {
  if (!order.value) return;
  const note = t(noteKey);
  const result = await orderStore.changeStatus(order.value.id, newStatus, note);
  feedback.value = result ? t('orders.detail.feedbackSaved', { status: t(`orders.status.${newStatus}`) }) : t('orders.detail.feedbackError');
}

function goBack() {
  router.push('/solicitudes');
}
</script>

<template>
  <section class="order-detail">
    <header class="view-header">
      <div>
        <h1 class="m-0">{{ t('orders.detail.title') }}</h1>
        <p class="subtitle m-0">{{ t('orders.detail.subtitle') }}</p>
      </div>
      <pv-button :label="t('orders.detail.back')" icon="pi pi-arrow-left" outlined @click="goBack" />
    </header>

    <div v-if="order" class="detail-grid">
      <div class="main-column">
        <!-- Encabezado de la solicitud -->
        <pv-card>
          <template #content>
            <div class="order-head">
              <div>
                <h2 class="m-0">{{ order.id }}</h2>
                <small>{{ t('orders.detail.materialsRequest') }}</small>
              </div>
              <div class="head-tags">
                <div>
                  <small class="d-block">{{ t('orders.table.status') }}</small>
                  <pv-tag :value="t(`orders.status.${order.status}`)" :severity="orderStatusSeverity(order.status)" />
                </div>
                <div>
                  <small class="d-block">{{ t('orders.table.priority') }}</small>
                  <pv-tag :value="t(`orders.priority.${order.priority}`)" :severity="orderPrioritySeverity(order.priority)" />
                </div>
              </div>
            </div>
          </template>
        </pv-card>

        <!-- Información general -->
        <pv-card>
          <template #content>
            <h3 class="section-title">{{ t('orders.detail.generalInfo') }}</h3>
            <div class="info-grid">
              <div><small>{{ t('orders.detail.work') }}</small><p>{{ order.projectName }}</p></div>
              <div><small>{{ t('orders.detail.date') }}</small><p>{{ order.date }}</p></div>
              <div><small>{{ t('orders.detail.requester') }}</small><p>{{ order.requesterName }}</p></div>
              <div><small>{{ t('orders.detail.mainMaterial') }}</small><p>{{ order.mainMaterial }}</p></div>
            </div>
          </template>
        </pv-card>

        <!-- Materiales solicitados (OrderItems) -->
        <pv-card>
          <template #content>
            <h3 class="section-title">{{ t('orders.detail.requestedMaterials') }}</h3>
            <pv-data-table :value="order.items" data-key="id" responsive-layout="scroll">
              <pv-column field="material" :header="t('orders.detail.material')" />
              <pv-column field="quantity" :header="t('orders.detail.qty')" />
              <pv-column field="unit" :header="t('orders.detail.unit')" />
              <pv-column field="observation" :header="t('orders.detail.observation')" />
            </pv-data-table>
          </template>
        </pv-card>

        <div class="two-col">
          <!-- Observaciones -->
          <pv-card>
            <template #content>
              <h3 class="section-title">{{ t('orders.detail.observations') }}</h3>
              <p class="observations">{{ order.observations || t('orders.detail.noObservations') }}</p>
            </template>
          </pv-card>

          <!-- Archivos adjuntos -->
          <pv-card>
            <template #content>
              <h3 class="section-title">{{ t('orders.detail.attachedFiles') }}</h3>
              <ul class="files-list">
                <li v-for="file in order.attachedFiles" :key="file.id">
                  <i class="pi pi-file mr-2" />
                  <span class="file-name">{{ file.name }}</span>
                  <small>{{ file.type }} · {{ file.size }}</small>
                </li>
                <li v-if="!order.attachedFiles.length" class="empty">{{ t('orders.detail.noFiles') }}</li>
              </ul>
            </template>
          </pv-card>
        </div>
      </div>

      <div class="side-column">
        <!-- Tomar decisión -->
        <pv-card>
          <template #content>
            <h3 class="section-title">{{ t('orders.detail.makeDecision') }}</h3>
            <p class="decision-hint">{{ t('orders.detail.decisionHint') }}</p>
            <div class="decision-actions">
              <pv-button :label="t('orders.detail.approve')" icon="pi pi-check" class="w-full"
                         :disabled="order.status === ORDER_STATUS.APPROVED"
                         @click="decide(ORDER_STATUS.APPROVED, 'orders.detail.notes.approved')" />
              <pv-button :label="t('orders.detail.requestChanges')" icon="pi pi-pencil" outlined class="w-full"
                         @click="decide(ORDER_STATUS.UNDER_REVIEW, 'orders.detail.notes.changes')" />
              <pv-button :label="t('orders.detail.reject')" icon="pi pi-times" severity="danger" outlined class="w-full"
                         :disabled="order.status === ORDER_STATUS.REJECTED"
                         @click="decide(ORDER_STATUS.REJECTED, 'orders.detail.notes.rejected')" />
            </div>
            <p v-if="feedback" class="feedback">{{ feedback }}</p>
          </template>
        </pv-card>

        <!-- Historial (timeline) -->
        <pv-card>
          <template #content>
            <h3 class="section-title">{{ t('orders.detail.history') }}</h3>
            <Timeline :value="order.timeline">
              <template #content="{ item }">
                <strong>{{ item.title }}</strong>
                <p class="m-0">{{ item.description }}</p>
                <small>{{ item.user }} · {{ item.date }}</small>
              </template>
            </Timeline>
          </template>
        </pv-card>
      </div>
    </div>

    <div v-else class="not-found">
      <i class="pi pi-inbox text-4xl" />
      <p>{{ t('orders.detail.notFound') }}</p>
    </div>
  </section>
</template>

<style scoped>
.order-detail { width: 100%; display: flex; flex-direction: column; gap: var(--sp-16); }
.order-detail, .order-detail :deep(.p-card), .order-detail :deep(.p-step) { color: var(--color-text-main); }
.order-detail :deep(.p-button:not(.p-button-outlined):not(.p-button-text)) { color: #fff; }
.order-detail :deep(.p-card) { }
.view-header { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--sp-16); flex-wrap: wrap; }
.subtitle { opacity: 0.7; font-size: 14px; margin-top: 4px; }

.detail-grid { display: grid; grid-template-columns: 2fr 1fr; gap: var(--sp-16); align-items: start; }
.main-column, .side-column { display: flex; flex-direction: column; gap: var(--sp-16); }

.order-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--sp-16); }
.head-tags { display: flex; gap: var(--sp-24); }
.d-block { display: block; margin-bottom: 4px; }

.section-title { margin-bottom: var(--sp-16); }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-16); }
.info-grid p { margin: 2px 0 0; font-weight: 500; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-16); }

.observations { line-height: 1.6; }
.files-list, .timeline { list-style: none; padding: 0; margin: 0; }
.files-list li { display: flex; align-items: center; gap: var(--sp-8); padding: var(--sp-8) 0; border-bottom: 1px solid var(--p-content-border-color); }
.file-name { font-weight: 500; flex: 1; }
.files-list .empty, .empty { }

.decision-hint { margin-bottom: var(--sp-16); }
.decision-actions { display: flex; flex-direction: column; gap: var(--sp-8); }
.feedback { margin-top: var(--sp-16); font-weight: 500; }


.not-found { text-align: center; padding: var(--sp-48); }

@media (max-width: 1100px) { .detail-grid { grid-template-columns: 1fr; } .two-col { grid-template-columns: 1fr; } }
</style>
