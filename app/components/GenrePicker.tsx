import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface GenreItem {
    genre: string;
    describe?: string;
}

interface GenrePickerProps {
    genres: GenreItem[];
    selectedGenres: string[];
    onChange: (genres: string[]) => void;
}

export default function GenrePicker({ genres = [], selectedGenres = [], onChange }: GenrePickerProps) {
    const toggleGenre = (genreKey: string) => {
        const next = selectedGenres.includes(genreKey)
            ? selectedGenres.filter((g) => g !== genreKey)
            : [...selectedGenres, genreKey];
        onChange(next);
    };

    return (
        <View style={styles.container}>
            {genres.map(({ genre, describe }) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                    <TouchableOpacity
                        key={genre}
                        onPress={() => toggleGenre(genre)}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.text, isSelected && styles.textSelected]}>
                            {genre}
                        </Text>
                        {describe ? <Text style={styles.subText}>{describe}</Text> : null}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        paddingVertical: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#222",
        borderWidth: 1,
        borderColor: "#333",
        margin: 4,
        maxWidth: "45%",
    },
    chipSelected: {
        backgroundColor: "#007AFF",
        borderColor: "#007AFF",
    },
    text: {
        fontSize: 14,
        color: "#fff",
    },
    textSelected: {
        color: "#fff",
        fontWeight: "bold",
    },
    subText: {
        fontSize: 10,
        color: "#aaa",
        marginTop: 2,
    },
});
