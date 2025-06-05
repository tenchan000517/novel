// src/components/ui/dialog.tsx
'use client';

import React, { Fragment } from 'react';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { Button } from './button';

/**
 * ダイアログコンポーネントのプロップス
 */
export interface DialogProps {
  /**
   * ダイアログを開くかどうか
   */
  isOpen: boolean;
  /**
   * ダイアログを閉じる関数
   */
  onClose: () => void;
  /**
   * タイトル
   */
  title?: string;
  /**
   * 説明
   */
  description?: string;
  /**
   * 子要素
   */
  children: React.ReactNode;
  /**
   * フッター
   */
  footer?: React.ReactNode;
  /**
   * 最大幅
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

/**
 * ダイアログコンポーネント
 */
export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}) => {
  // 最大幅のマッピング
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <HeadlessDialog
        as="div"
        className="relative z-50"
        onClose={onClose}
      >
        {/* 背景のオーバーレイ */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        {/* モーダルコンテナ */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <HeadlessDialog.Panel
                className={`w-full ${maxWidthClasses[maxWidth]} transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all`}
              >
                {/* ヘッダー部分 */}
                {(title || description) && (
                  <div className="mb-4">
                    {title && (
                      <HeadlessDialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        {title}
                      </HeadlessDialog.Title>
                    )}
                    {description && (
                      <p className="mt-2 text-sm text-gray-500">
                        {description}
                      </p>
                    )}
                  </div>
                )}

                {/* メインコンテンツ */}
                <div className="mt-2">{children}</div>

                {/* フッター部分 */}
                {footer && (
                  <div className="mt-4 flex justify-end space-x-2">{footer}</div>
                )}
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  );
};

/**
 * 確認ダイアログコンポーネントのプロップス
 */
export interface ConfirmDialogProps {
  /**
   * ダイアログを開くかどうか
   */
  isOpen: boolean;
  /**
   * ダイアログを閉じる関数
   */
  onClose: () => void;
  /**
   * 確認時のコールバック
   */
  onConfirm: () => void;
  /**
   * タイトル
   */
  title: string;
  /**
   * メッセージ
   */
  message: string;
  /**
   * 確認ボタンのテキスト
   */
  confirmText?: string;
  /**
   * キャンセルボタンのテキスト
   */
  cancelText?: string;
  /**
   * 確認ボタンの種類
   */
  confirmVariant?: 'primary' | 'danger';
}

/**
 * 確認ダイアログコンポーネント
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '確認',
  cancelText = 'キャンセル',
  confirmVariant = 'primary',
}) => {
  const handleConfirm = (): void => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Dialog>
  );
};