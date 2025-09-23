import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Image} from 'expo-image';
import {AuctionItem} from "@/types/items";







export interface CardProps {
    item: AuctionItem,
    onPress?: () => void
}

export const CardContent: React.FC<CardProps> = ({item, onPress}: CardProps) => {
    const [calculatedHeight, setCalculatedHeight] = useState<number | null>(null);
    const padding = 8;

    const preview =
        item?.description?.length && item.description.length > 120
            ? item.description.substring(0, 117).trim() + '...'
            : item.description ?? '';

    const tagList = item?.tags?.split(',').map((tag: string) => tag.trim()).filter(Boolean) ?? [];
    const [items, setItems] = useState<AuctionItem[]>([]);

    return (
        <View style={[styles.card, calculatedHeight ? {height: calculatedHeight + padding} : null]}>
            <Image
                source={item.photo_url ?? ''}
                style={styles.image}
                contentFit="cover"
            />
            <View style={styles.cardContent}>
                <Text style={styles.title}>{item.name ?? 'Untitled Item'}</Text>
                <Text
                    style={styles.description}
                    numberOfLines={3}
                    ellipsizeMode="tail"
                    onTextLayout={({nativeEvent}) => {
                        const totalHeight = nativeEvent.lines?.reduce((sum, line) => sum + line.height, 0) ?? 0;
                        setCalculatedHeight(totalHeight);
                    }}
                >
                    {preview}
                </Text>
                <Text style={styles.price}>
                    {item.price ? `$${item.price}` : 'No price listed'}
                </Text>
                <View style={styles.tagContainer}>
                    {tagList.map((tag: string) => (
                        <Text style={styles.tag} key={tag}>
                            {tag}
                        </Text>
                    ))}
                </View>
            </View>
        </View>
    );
};

// Also export as default
export default CardContent;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        padding: 12,

        marginBottom: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 4,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    cardContent: {
        flex: 1,
        paddingLeft: 12,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    description: {
        fontSize: 14,
        lineHeight: 18,
        color: '#444',
        marginBottom: 8,
        flexWrap: 'wrap',
        flexShrink: 1,
    },
    price: {
        fontSize: 16,
        fontWeight: '500',
        color: '#7D5BA6',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    tag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        color: '#444',
        fontSize: 12,
    },
});