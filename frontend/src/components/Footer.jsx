import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation('common');
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-lg font-bold mb-4">{t('common.companyName')}</h3>
            <p className="text-gray-300">
              {t('home.hero.subtitle')}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.quickLinks', 'Quick Links')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-teal-400">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-teal-400">
                  {t('nav.pricing')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-teal-400">
                  {t('nav.register')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-teal-400">
                  {t('nav.login')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-2 text-gray-300">
              <li>support@imagenwiz.com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-center text-gray-400">
            {t('footer.copyright', `© ${year} iMagenWiz. All rights reserved.`)}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;