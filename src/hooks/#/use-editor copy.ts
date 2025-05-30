// src/hooks/use-editor.ts
import { useState, useEffect } from 'react';

interface Document {
    id: string;
    title: string;
    content: string;
    metadata?: {
      qualityScore?: number;
      [key: string]: any;
    };
  }

export const useEditor = () => {
  const [originalDocument, setOriginalDocument] = useState<Document | null>(null);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  
  useEffect(() => {
    // モックデータを設定
    const document: Document = {
      id: 'doc-1',
      title: '運命の十字路',
      content: `第42章 運命の十字路

高橋勇気は古代寺院の入り口に立ち、深く息を吸い込んだ。夕暮れの光が石造りの建物に橙色の輝きを与え、不思議な雰囲気を醸し出していた。

「本当にここに入るの？」鈴木美咲が不安そうに尋ねた。彼女の声には明らかな緊張感があった。

「ああ、他に選択肢はない」勇気は静かに答えた。「伝説の剣がここにあるなら、それを手に入れなければならない」

美咲は黙ってうなずいた。二人は長い旅の末にここまでたどり着いたのだ。引き返すわけにはいかなかった。

重い石の扉を押し開けると、内部は予想外に明るかった。天井の一部が崩れ落ち、そこから射し込む夕日の光が内部を照らしていたのだ。

「気をつけて」勇気は前に進みながら言った。「罠があるかもしれない」

彼らが中央の広間に到達すると、そこには古代の祭壇が見えた。そして祭壇の上には…何もなかった。

「剣がない…」勇気は愕然とした。

「誰かが先に持っていったの？」美咲は周囲を見回した。

突然、彼らの背後で声がした。

「探しものですか？」

振り向くと、黒いローブを着た男が立っていた。彼の手には輝く剣があった。

「佐藤！」勇気は驚きの声を上げた。「どうして君が…」

「私がずっと先を行っていたと思わなかったのか？」佐藤は冷たく笑った。「この剣の力を手に入れるのは私だ」

勇気は構えた。「その剣は世界を救うためのものだ。渡してくれ」

「世界？」佐藤は嘲笑した。「私はもっと大きなことを考えている。この剣で新しい世界を創造するつもりだ」

緊張が高まる中、美咲が前に出た。

「佐藤くん、お願い。みんな心配しているわ。一緒に帰りましょう」

佐藤の顔に一瞬、迷いが浮かんだ。しかし、すぐに消えた。

「もう遅い」彼は剣を掲げた。「始まったことは止められない」

勇気と美咲は互いに顔を見合わせた。これからどうするべきか、決断の時が来たのだ。`
    };
    
    setOriginalDocument(document);
    setCurrentDocument(document);
  }, []);
  
  const applyChanges = async () => {
    if (!currentDocument) return;
    
    setIsApplying(true);
    
    try {
      // APIリクエストをシミュレーション
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 変更を適用
      setOriginalDocument(currentDocument);
    } catch (error) {
      console.error('変更の適用に失敗しました:', error);
    } finally {
      setIsApplying(false);
    }
  };
  
  return {
    originalDocument,
    currentDocument,
    applyChanges,
    isApplying
  };
};