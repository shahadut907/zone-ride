import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ListRenderItem,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { ChatMessage, CustomerChatsStackParamList } from '../../types';
import { useApp } from '../../context/AppContext';
import ScreenHeader from '../../components/common/ScreenHeader';
import ChatBubble from '../../components/chat/ChatBubble';
import { mockPost } from '../../services/mockApi';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { glassValues } from '../../theme/glass';
import { LABELS } from '../../constants/labels';

type Props = StackScreenProps<CustomerChatsStackParamList, 'ChatDetail'>;

const ChatDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { threadId, participantName } = route.params;
  const { state, dispatch } = useApp();

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const thread = state.chats.find((t) => t.id === threadId);
  const messages = thread?.messages ?? [];
  const reversed = [...messages].reverse();

  const getBotReply = useCallback((userText: string): string => {
    const lower = userText.toLowerCase().trim();
    const name = participantName.split(' ')[0];

    // --- Greetings (EN + BN) ---
    if (/^(hi|hello|hey|assalamu|salam|hola|namaskar|kemon acho|kemon achen|ki khobor|ki holo)/i.test(lower)) {
      const replies = [
        `Assalamu Alaikum! ${name} bolchi. Ki help lagbe? 😊`,
        `Hi! ${name} here. Ami ekhon available. Bolen ki dorkar?`,
        `Walaikum Assalam! Bhai ki pathate hobe? 🚀`,
        `Hello! Ami ${name}. Kothay delivery lagbe bolen!`,
        `Ohe! Kemon achen? Ami ready, bolen ki dorkar 👋`,
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    // --- Location / Where are you (BN) ---
    if (/kothai|kothay|where|location|area|sector|zone|far|dur|koto dur|ekhon kothai|tomar location|position/i.test(lower)) {
      const replies = [
        `Ami ekhon main road er kache achi. 15-20 min er moddhe pochhe jabo! 📍`,
        `Bhai ami ekhon nearby e achi. Address den, chole jabo 🏍️`,
        `Ekdom kache e achi! Just delivery request create koren, aschi!`,
        `Ami ${name}, ekhon road e achi. Bolen kothay jete hobe?`,
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    // --- Price / Fee (BN) ---
    if (/price|cost|fee|charge|koto|taka|bdt|dam|daam|khoroch|rate|kitne|paisa/i.test(lower)) {
      const replies = [
        `Delivery fee distance er upor depend kore. Normally 30-80 BDT nearby areas er jonno 💰`,
        `Bhai kache hole 30-40 taka, dure hole 60-80 taka. Delivery request e set koren!`,
        `Rate ta apni set korben request form e. Ami reasonable hole accept korbo ✅`,
        `Area teh upor depend kore bhai. Usually 40-70 taka lagbe`,
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    // --- Time / How long (BN) ---
    if (/time|when|long|minute|hour|koto khon|kokhon|kobe|somoy|beshi|taratari|jaldi|quick|fast|ekhn/i.test(lower)) {
      const replies = [
        `10-15 min e pickup korbo, then 20-30 min delivery. Total 30-45 min 🕐`,
        `Bhai ami ekhon free. 10 min er moddhe pickup korte parbo!`,
        `Taratari jete parbo. Normally 25-35 min total time lage ⚡`,
        `Ekhn request dile 10 min er moddhe berie porbo. InshaAllah joto taratari possible!`,
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    // --- Thank you (BN) ---
    if (/thank|dhonnobad|thanks|tnx|shukriya|valo|bhalo|excellent|great|awesome|nice|good|bah/i.test(lower)) {
      const replies = [
        `Apnakeo dhonnobad! Aro kichu lagbe janaben 🙏`,
        `You're welcome bhai! Jokhn dorkar hobe call deben ✌️`,
        `Thank you! Aro kono help lagbe janaben amake`,
        `Alhamdulillah! Service valo lagle 5 star deben bhai ⭐`,
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    // --- Delivery / Order / Parcel ---
    if (/deliver|order|pick|parcel|item|send|pathao|pathai|niye|ante|nite|ana|dhor|porte/i.test(lower)) {
      const replies = [
        `Sure bhai! Delivery request create koren, ami ekhuni accept korbo 📦`,
        `Haan bhai, ekhn request den. Ami ready pickup korte!`,
        `Parcel ta ki? Address den, pickup kore niye jabo ✅`,
        `Okay! Request form e details den, ami on the way hye jabo!`,
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    // --- Food specific ---
    if (/food|khabar|khana|biryani|rice|bhat|khai|restaurant|dukan|hotel|momo|pizza|burger|chai/i.test(lower)) {
      const replies = [
        `Food delivery korte parbo! Kon restaurant theke ante hobe bolen 🍛`,
        `Haan bhai khabar ene debo! Restaurant er name ar address den`,
        `Food pickup ready thakle 10 min e niye jete parbo! 🍔`,
        `Acha bhai, order confirm koren restaurant e, ami pickup korbo`,
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    // --- Availability / Are you free ---
    if (/free|available|achen|acho|busy|kaj|korben|korba|paren|parba|possible/i.test(lower)) {
      const replies = [
        `Jee bhai, ami ekhon free achi! Bolen ki korte hobe 🟢`,
        `Haan available achi. Request den, ekhuni berie porbo!`,
        `Ami ekhon online e achi. Delivery nite ready! ✅`,
        `Free achi bhai! Kothay jete hobe bolen just`,
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    // --- Number / Phone ---
    if (/number|phone|call|fone|mobile|contact|dial/i.test(lower)) {
      const replies = [
        `Ami app er moddhe e call korte paren! Call button e click koren 📱`,
        `App thekei call dite parben bhai. Chat eo bolte paren!`,
        `Emergency hole app theke Call option e click koren`,
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    // --- Complaints / Problem ---
    if (/problem|somossa|issue|nosto|bhanga|broken|late|deri|angry|boka|complain|missing/i.test(lower)) {
      const replies = [
        `Sorry bhai! Ki somossa hoyeche bolen, solve korte chai 😔`,
        `Really sorry for the inconvenience. Ki hoyeche exactly? Ami fix kori`,
        `Bhai maaf korben. Problem ta bolen, ami try korbo theek korte 🙏`,
        `Apnar jonno sorry. Ki issue hocche bolen details e`,
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    // --- Yes / Confirmation ---
    if (/^(yes|yeah|ok|okay|haan|ha|ji|jee|accha|acha|thik|bol|bolo|hae|hmm|hm)$/i.test(lower)) {
      const replies = [
        `Great! Tahole delivery request create koren, ami accept korbo ✅`,
        `Okay bhai! Details ta den, ami ready 👍`,
        `Acha! Bolen ki pathate hobe? Address den 📍`,
        `Jee bhai! Request form e fill up koren, baki ami korbo`,
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    // --- No / Cancel ---
    if (/^(no|na|nah|cancel|bad|dorkar nai|lagbe na|thak)$/i.test(lower)) {
      const replies = [
        `Okay bhai no problem! Jokhn dorkar hobe amake message deben 😊`,
        `Acha thik ache! Pore dorkar hole janaben`,
        `Np! Ami ekhane e achi, jokhn lagbe bolen`,
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    // --- Farewell ---
    if (/bye|bhai|akhon|thak|rakh|pore|later|jai|jachi|off/i.test(lower)) {
      const replies = [
        `Okay bhai! Take care. Dorkar hole message deben! 👋`,
        `Bye! Allah Hafez. Aro kichu lagle janaben 🙏`,
        `Acha bhai, pore kotha hobe. Safe thaken! ✌️`,
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    // --- Weather / Rain ---
    if (/rain|brishti|garmi|thanda|weather|rood|roud/i.test(lower)) {
      const replies = [
        `Bhai weather je rokom e hok, ami delivery korbo! No tension 🌧️`,
        `Rain hole ektu slow hote pare but delivery hobe InshaAllah ☔`,
        `Ami all weather e deliver kori bhai. Tension neben na!`,
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    // --- Bangla catch-all patterns ---
    if (/ki|ky|bolo|bolun|bolba|janao|janan|bujhi|bujhte/i.test(lower)) {
      const replies = [
        `Jee bhai bolen! Ami shunchi 👂`,
        `Haan bolen ki dorkar? Ami ekhon available achi`,
        `Bolen bhai, ki help korte pari apnar jonno?`,
        `Ami ${name}, bolen ki lagbe? Delivery nite ready!`,
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    // --- Default / Catch-all ---
    const defaults = [
      `Bhai aro details dile valo hoy. Ki deliver korte hobe? 📦`,
      `Got it! Delivery request create koren, baki ami korbo 👍`,
      `Ami ${name}, ekhon ready. Request den chole jabo!`,
      `Sure bhai! Aro kichu janbar thakle bolen 🏍️`,
      `Okay! Address ta den, ami estimate debo koto time lagbe`,
      `Hmm bujhlam. Request form e details fill up koren, ami accept korbo!`,
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  }, [participantName]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isSending) return;
    setInputText('');
    setIsSending(true);

    const newMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      senderRole: 'customer',
      text,
      timestamp: new Date().toISOString(),
    };
    await mockPost(newMessage);
    dispatch({
      type: 'ADD_CHAT_MESSAGE',
      payload: { threadId, message: newMessage },
    });
    setIsSending(false);

    // Bot auto-reply after 1.5 seconds
    const replyText = getBotReply(text);
    const senderRole = thread?.participantRole ?? 'rider';
    setTimeout(() => {
      const botReply: ChatMessage = {
        id: 'msg_bot_' + Date.now(),
        senderRole,
        text: replyText,
        timestamp: new Date().toISOString(),
      };
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: { threadId, message: botReply },
      });
    }, 1500);
  }, [inputText, isSending, threadId, dispatch, getBotReply, thread?.participantRole]);

  const renderItem: ListRenderItem<ChatMessage> = useCallback(
    ({ item }) => (
      <ChatBubble message={item} isOwn={item.senderRole === 'customer'} />
    ),
    []
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScreenHeader
        title={participantName}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages list */}
        <FlatList
          ref={listRef}
          data={reversed}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          inverted
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrapper}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name={'chatbubble-ellipses-outline' as keyof typeof Ionicons.glyphMap}
                  size={48}
                  color={colors.textMuted}
                />
              </View>
              <Text style={styles.emptyTitle}>Start a conversation</Text>
            </View>
          }
        />

        {/* Input bar — fixed above tab bar */}
        <View style={styles.inputBarOuter}>
          <View style={styles.inputBar}>
            <View style={styles.inputField}>
              <TextInput
                style={styles.input}
                placeholder={LABELS.typeMessage}
                placeholderTextColor={colors.textMuted}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
            </View>
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || isSending}
              style={[
                styles.sendBtn,
                (!inputText.trim() || isSending) && styles.sendBtnDisabled,
              ]}
              activeOpacity={0.8}
            >
              <Ionicons
                name={'send' as keyof typeof Ionicons.glyphMap}
                size={18}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    flexGrow: 1,
  },
  // Empty state — rendered inside inverted FlatList,
  // rotate 180deg to flip back right-side-up
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    transform: [{ rotate: '180deg' }],
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: glassValues.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
    lineHeight: 20,
  },
  // Input bar sits at the bottom, above keyboard when active
  inputBarOuter: {
    paddingBottom: Platform.OS === 'ios' ? 30 : 8,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 6,
  },
  inputField: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    borderWidth: 0,
    minHeight: 36,
    justifyContent: 'center',
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 100,
    minHeight: 36,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.3,
  },
});

export default ChatDetailScreen;
