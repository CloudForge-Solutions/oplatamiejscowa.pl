import React, { useState } from 'react';
import { Form, Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface GDPRConsentProps {
  onConsentChange?: (consents: Array<{ type: string; given: boolean; timestamp: string }>) => void;
}

const GDPRConsent: React.FC<GDPRConsentProps> = ({ onConsentChange }) => {
  const { t } = useTranslation('tourist-tax');
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [consents, setConsents] = useState({
    dataProcessing: false,
    emailMarketing: false
  });

  const handleConsentChange = (type: 'dataProcessing' | 'emailMarketing', value: boolean) => {
    const updatedConsents = { ...consents, [type]: value };
    setConsents(updatedConsents);

    if (onConsentChange) {
      const consentArray = [
        {
          type: 'data_processing',
          given: updatedConsents.dataProcessing,
          timestamp: new Date().toISOString()
        },
        {
          type: 'email_marketing',
          given: updatedConsents.emailMarketing,
          timestamp: new Date().toISOString()
        }
      ];
      onConsentChange(consentArray);
    }
  };

  return (
    <>
      <div className='gdpr-consent-section'>
        <h6 className='mb-3'>Zgody RODO</h6>

        {/* Required Data Processing Consent */}
        <Form.Check
          type='checkbox'
          id='gdpr-data-processing'
          className='mb-3'
          checked={consents.dataProcessing}
          onChange={e => handleConsentChange('dataProcessing', e.target.checked)}
          label={
            <span>
              {t('gdpr.dataProcessing')} <span className='text-danger'>*</span>
              <br />
              <small className='text-muted'>{t('gdpr.required')}</small>
            </span>
          }
          required
        />

        {/* Optional Email Marketing Consent */}
        <Form.Check
          type='checkbox'
          id='gdpr-email-marketing'
          className='mb-3'
          checked={consents.emailMarketing}
          onChange={e => handleConsentChange('emailMarketing', e.target.checked)}
          label={
            <span>
              {t('gdpr.emailMarketing')}
              <br />
              <small className='text-muted'>{t('gdpr.optional')}</small>
            </span>
          }
        />

        {/* Links to policies */}
        <div className='d-flex gap-3 mt-3'>
          <Button
            variant='link'
            size='sm'
            className='p-0 text-decoration-none'
            onClick={() => setShowPrivacyPolicy(true)}
          >
            <i className='bi bi-shield-check me-1'></i>
            {t('gdpr.privacyPolicy')}
          </Button>
          <Button
            variant='link'
            size='sm'
            className='p-0 text-decoration-none'
            onClick={() => setShowTerms(true)}
          >
            <i className='bi bi-file-text me-1'></i>
            {t('gdpr.termsOfService')}
          </Button>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <Modal show={showPrivacyPolicy} onHide={() => setShowPrivacyPolicy(false)} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Polityka Prywatności</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <h6>1. Administrator danych</h6>
          <p>
            Administratorem Twoich danych osobowych jest Opłata Miejscowa Online, z siedzibą w
            Polsce.
          </p>

          <h6>2. Cel przetwarzania danych</h6>
          <p>Twoje dane osobowe przetwarzamy w celu:</p>
          <ul>
            <li>Realizacji płatności opłaty miejscowej</li>
            <li>Wystawienia potwierdzenia płatności</li>
            <li>Wypełnienia obowiązków prawnych</li>
            <li>Kontaktu w sprawach związanych z płatnością (za zgodą)</li>
          </ul>

          <h6>3. Podstawa prawna</h6>
          <p>Przetwarzanie danych odbywa się na podstawie:</p>
          <ul>
            <li>Art. 6 ust. 1 lit. b RODO - wykonanie umowy</li>
            <li>Art. 6 ust. 1 lit. c RODO - obowiązek prawny</li>
            <li>Art. 6 ust. 1 lit. a RODO - zgoda (marketing)</li>
          </ul>

          <h6>4. Okres przechowywania</h6>
          <p>
            Dane przechowujemy przez okres niezbędny do realizacji celów, nie dłużej niż przez 5 lat
            od daty płatności.
          </p>

          <h6>5. Twoje prawa</h6>
          <p>Masz prawo do:</p>
          <ul>
            <li>Dostępu do swoich danych</li>
            <li>Sprostowania danych</li>
            <li>Usunięcia danych</li>
            <li>Ograniczenia przetwarzania</li>
            <li>Przenoszenia danych</li>
            <li>Wniesienia sprzeciwu</li>
            <li>Cofnięcia zgody</li>
          </ul>

          <h6>6. Bezpieczeństwo</h6>
          <p>
            Stosujemy odpowiednie środki techniczne i organizacyjne w celu ochrony Twoich danych
            osobowych.
          </p>

          <h6>7. Cookies</h6>
          <p>
            Używamy plików cookies niezbędnych do funkcjonowania serwisu oraz analitycznych (za
            zgodą).
          </p>

          <h6>8. Kontakt</h6>
          <p>
            W sprawach dotyczących ochrony danych skontaktuj się z nami pod adresem:
            privacy@oplatamiejscowa.pl
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowPrivacyPolicy(false)}>
            Zamknij
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal show={showTerms} onHide={() => setShowTerms(false)} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Regulamin Usługi</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <h6>1. Postanowienia ogólne</h6>
          <p>Niniejszy regulamin określa zasady korzystania z serwisu Opłata Miejscowa Online.</p>

          <h6>2. Definicje</h6>
          <ul>
            <li>
              <strong>Serwis</strong> - aplikacja internetowa do płatności opłaty miejscowej
            </li>
            <li>
              <strong>Użytkownik</strong> - osoba korzystająca z serwisu
            </li>
            <li>
              <strong>Opłata miejscowa</strong> - podatek lokalny pobierany od turystów
            </li>
          </ul>

          <h6>3. Zasady korzystania</h6>
          <p>Korzystanie z serwisu jest bezpłatne. Użytkownik zobowiązuje się do:</p>
          <ul>
            <li>Podawania prawdziwych danych</li>
            <li>Niepodejmowania działań szkodliwych</li>
            <li>Przestrzegania przepisów prawa</li>
          </ul>

          <h6>4. Płatności</h6>
          <p>
            Płatności są realizowane przez licencjonowanego operatora płatności imoje (ING Bank
            Śląski). Serwis nie przechowuje danych płatniczych.
          </p>

          <h6>5. Odpowiedzialność</h6>
          <p>
            Operator serwisu nie ponosi odpowiedzialności za szkody wynikające z nieprawidłowego
            użytkowania serwisu.
          </p>

          <h6>6. Reklamacje</h6>
          <p>
            Reklamacje można składać na adres: reklamacje@oplatamiejscowa.pl Odpowiedź zostanie
            udzielona w ciągu 14 dni roboczych.
          </p>

          <h6>7. Zmiany regulaminu</h6>
          <p>
            Operator zastrzega sobie prawo do zmiany regulaminu. Użytkownicy zostaną poinformowani o
            zmianach.
          </p>

          <h6>8. Prawo właściwe</h6>
          <p>Do regulaminu stosuje się prawo polskie. Spory rozstrzygane są przez sądy polskie.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowTerms(false)}>
            Zamknij
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GDPRConsent;
