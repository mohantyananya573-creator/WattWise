import React, { useState } from 'react';
import { isFirebaseConfigured } from '../../firebase/firebaseConfig';
import { Database, CheckCircle2, AlertCircle, ExternalLink, HelpCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export const FirebaseStatusBanner: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-white border-b border-brand-border px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          {isFirebaseConfigured ? (
            <span className="flex items-center gap-1.5 font-medium text-brand-dark bg-brand-light px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
              Firebase Cloud Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Firebase Local Preview Active
            </span>
          )}
          <span className="text-brand-muted hidden sm:inline">
            {isFirebaseConfigured
              ? 'Real-time synchronization with Google Cloud Firestore & Firebase Auth.'
              : 'Add your Firebase credentials to .env to synchronize with your live cloud backend.'}
          </span>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="text-brand-primary hover:text-brand-dark flex items-center gap-1 font-semibold hover:underline"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Firebase Setup Guide
        </button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Firebase Backend Integration Guide"
        description="Connect WattWise to your Google Cloud Firebase project"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-brand-text">
          <p className="text-sm">
            WattWise is fully built using official Firebase JavaScript SDK v11 (Firebase Auth + Cloud Firestore + Security Rules).
          </p>

          <div className="space-y-3 bg-brand-pale p-4 rounded-xl border border-brand-border">
            <h4 className="font-bold text-brand-dark flex items-center gap-1.5">
              <Database className="w-4 h-4 text-brand-primary" />
              3 Quick Steps to Connect Live Firebase:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-brand-text leading-relaxed">
              <li>
                <strong>Create a Firebase Project</strong> at{' '}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-primary underline inline-flex items-center gap-0.5"
                >
                  console.firebase.google.com <ExternalLink className="w-3 h-3" />
                </a>.
              </li>
              <li>
                Enable <strong>Authentication</strong> (Email/Password provider) and <strong>Cloud Firestore</strong> (production or test mode).
              </li>
              <li>
                Copy your Web App credentials into a <code className="bg-white px-1.5 py-0.5 rounded border border-brand-border">.env</code> file in the project root:
              </li>
            </ol>
            <pre className="bg-brand-dark text-emerald-200 p-3 rounded-lg overflow-x-auto text-[11px] font-mono">
{`VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef`}
            </pre>
          </div>

          <div className="p-3 bg-brand-light rounded-xl border border-brand-primary/20 text-brand-dark">
            <p className="font-semibold mb-1">Firestore Security Rules Included:</p>
            <p className="text-[11px] text-brand-muted">
              Pre-configured rules in <code className="font-mono text-brand-dark">firestore.rules</code> restrict user records to their authenticated owners and protect emissions factors.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => setShowModal(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
