import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '../../types';
import { colors, spacing, fontSize } from '../../theme/tokens';
import { formatTimestamp } from '../../utils/statusHelpers';

type ChatBubbleProps = {
  message: ChatMessage;
  isOwn: boolean;
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwn }) => {
  return (
    <View style={[styles.wrapper, isOwn ? styles.wrapperOwn : styles.wrapperOther]}>
      <View
        style={[
          styles.bubble,
          isOwn ? styles.bubbleOwn : styles.bubbleOther,
        ]}
      >
        <Text style={[styles.text, isOwn ? styles.textOwn : styles.textOther]}>
          {message.text}
        </Text>
      </View>
      <Text
        style={[
          styles.timestamp,
          isOwn ? styles.timestampOwn : styles.timestampOther,
        ]}
      >
        {formatTimestamp(message.timestamp)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 2,
    marginHorizontal: spacing.md,
    maxWidth: '75%',
    gap: 1,
  },
  wrapperOwn: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  wrapperOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  bubbleOwn: {
    backgroundColor: colors.chatOwnBubble,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#E9E9EB',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  textOwn: {
    color: colors.chatOwnText,
  },
  textOther: {
    color: '#1C1C1E',
  },
  timestamp: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1,
  },
  timestampOwn: {
    marginRight: 4,
  },
  timestampOther: {
    marginLeft: 4,
  },
});

export default ChatBubble;
