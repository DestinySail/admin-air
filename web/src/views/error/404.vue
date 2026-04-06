<template>
    <div class="not-found-page">
        <div class="ambient ambient-left"></div>
        <div class="ambient ambient-right"></div>
        <section class="scene">
            <div class="poster-wrap">
                <div class="poster-backdrop"></div>
                <div class="poster-frame">
                    <img class="poster-image" src="/404-bg.png" :alt="t('404.Poster alt')" />
                </div>
            </div>
            <aside class="info-panel">
                <span class="status-pill">404 / NOT FOUND</span>
                <h1 class="info-title">{{ t('404.Page title') }}</h1>
                <p class="info-description">{{ t('404.Page description') }}</p>
                <div class="info-actions">
                    <button class="action-pill action-pill-primary" type="button" @click="goHome">
                        {{ t('404.Return to home page') }}
                    </button>
                    <button class="action-pill" type="button" @click="goBack">
                        {{ t('404.Back to previous page') }}
                    </button>
                </div>
                <p class="info-hint">{{ t('404.Page hint') }}</p>
            </aside>
        </section>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { translate as t } from '/@/utils/translate'

const router = useRouter()

const goHome = () => {
    router.push('/')
}

const goBack = () => {
    const historyState = window.history.state as { back?: string | null } | null
    if (historyState?.back) {
        router.back()
        return
    }
    goHome()
}
</script>

<style scoped lang="scss">
.not-found-page {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    padding: clamp(24px, 4vw, 48px);
    background:
        radial-gradient(circle at top left, rgba(255, 255, 255, 0.4), transparent 28%),
        radial-gradient(circle at 85% 12%, rgba(255, 255, 255, 0.18), transparent 24%), linear-gradient(135deg, #f6ccd6 0%, #ef9fb7 42%, #f7b9ca 100%);
}

.ambient {
    position: absolute;
    border-radius: 999px;
    pointer-events: none;
    filter: blur(12px);
}

.ambient-left {
    top: -170px;
    left: -140px;
    width: 420px;
    height: 420px;
    background: rgba(255, 255, 255, 0.24);
}

.ambient-right {
    right: -140px;
    bottom: -180px;
    width: 460px;
    height: 460px;
    background: rgba(199, 58, 123, 0.2);
}

.scene {
    position: relative;
    width: min(1520px, 100%);
    min-height: calc(100vh - clamp(48px, 8vw, 96px));
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
}

.poster-wrap {
    position: relative;
    width: min(1120px, calc(100% - 360px));
}

.poster-backdrop {
    position: absolute;
    inset: 36px -20px -20px 36px;
    border-radius: 38px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0.06));
    border: 1px solid rgba(255, 255, 255, 0.24);
}

.poster-frame {
    position: relative;
    overflow: hidden;
    padding: 18px;
    border-radius: 40px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.38), rgba(255, 255, 255, 0.18));
    border: 1px solid rgba(255, 255, 255, 0.32);
    box-shadow: 0 36px 90px rgba(129, 39, 85, 0.2);
    backdrop-filter: blur(20px);
}

.poster-image {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 26px;
    object-fit: cover;
    box-shadow: 0 20px 44px rgba(134, 48, 94, 0.16);
}

.info-panel {
    position: absolute;
    top: 50%;
    right: 0;
    width: min(360px, 34vw);
    padding: 30px;
    border-radius: 30px;
    transform: translateY(-50%);
    background: rgba(255, 247, 250, 0.32);
    border: 1px solid rgba(255, 255, 255, 0.46);
    box-shadow: 0 26px 80px rgba(132, 37, 82, 0.18);
    backdrop-filter: blur(22px);
    color: #7d2553;
}

.info-panel::before {
    content: '404';
    position: absolute;
    top: 12px;
    right: 18px;
    font-size: 72px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.2);
    pointer-events: none;
}

.status-pill {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.46);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: #9a2d61;
}

.info-title {
    position: relative;
    margin: 18px 0 12px;
    font-family: 'Bahnschrift', 'Avenir Next', 'Segoe UI', sans-serif;
    font-size: clamp(34px, 4vw, 48px);
    line-height: 1.04;
    letter-spacing: 0.04em;
    color: #7a1944;
}

.info-description {
    position: relative;
    margin: 0;
    font-size: 15px;
    line-height: 1.8;
    color: rgba(108, 35, 72, 0.88);
}

.info-actions {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
}

.action-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    border: 0;
    border-radius: 999px;
    padding: 14px 18px;
    background: rgba(255, 255, 255, 0.44);
    box-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.5),
        0 10px 24px rgba(157, 58, 104, 0.08);
    color: #872457;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        background 0.2s ease;
}

.action-pill:hover {
    transform: translateY(-2px);
    box-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.6),
        0 16px 28px rgba(157, 58, 104, 0.14);
}

.action-pill-primary {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 228, 236, 0.92) 52%, rgba(255, 213, 228, 0.92));
}

.info-hint {
    position: relative;
    margin: 20px 0 0;
    padding-top: 18px;
    border-top: 1px solid rgba(255, 255, 255, 0.42);
    font-size: 13px;
    line-height: 1.7;
    color: rgba(114, 40, 76, 0.78);
}

@media screen and (max-width: 1180px) {
    .scene {
        display: block;
    }

    .poster-wrap {
        width: 100%;
    }

    .info-panel {
        position: static;
        width: min(560px, 100%);
        margin: 28px auto 0;
        transform: none;
    }
}

@media screen and (max-width: 720px) {
    .not-found-page {
        padding: 18px;
    }

    .scene {
        min-height: auto;
    }

    .poster-backdrop {
        inset: 24px -8px -8px 24px;
        border-radius: 26px;
    }

    .poster-frame {
        padding: 10px;
        border-radius: 26px;
    }

    .poster-image {
        border-radius: 18px;
    }

    .info-panel {
        padding: 22px 18px;
        border-radius: 24px;
    }

    .info-panel::before {
        top: 14px;
        right: 14px;
        font-size: 54px;
    }

    .info-title {
        font-size: 32px;
    }

    .info-description {
        font-size: 14px;
    }
}
</style>
