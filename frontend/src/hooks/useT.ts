/**
 * useT, returns the translation object for the current app language.
 *
 * Usage:
 *   const t = useT();
 *   <h1>{t.explain_title}</h1>
 */
import { useConversationStore } from "../store/conversationStore";
import { getTranslations } from "../utils/translations";

export function useT() {
  const { appLanguage } = useConversationStore();
  return getTranslations(appLanguage);
}
