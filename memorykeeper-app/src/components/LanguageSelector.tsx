
import { type FC, type ChangeEvent } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { useAppState } from '../lib/AppStateContext';
import { useTranslation } from 'react-i18next';

const LanguageSelector: FC = () => {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const { dispatch } = useAppState();
  const { t } = useTranslation();

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as any;
    setLanguage(newLanguage);
    dispatch({ type: 'SET_LANGUAGE', payload: newLanguage });
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="language-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('settings.language')}:
      </label>
      <select
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:text-white"
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
