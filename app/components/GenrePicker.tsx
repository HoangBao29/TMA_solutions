import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const GENRE_MAPPING: Record<string, string> = {
    "Action": "Hành động",
    "Adventure": "Phiêu lưu",
    "Animation": "Hoạt hình",
    "Children's": "Trẻ em",
    "Comedy": "Hài hước",
    "Crime": "Tội phạm",
    "Documentary": "Tài liệu",
    "Drama": "Kịch tính",
    "Fantasy": "Kỳ ảo",
    "Film-Noir": "Phim đen",
    "Horror": "Kinh dị",
    "Musical": "Âm nhạc",
    "Mystery": "Bí ẩn",
    "Romance": "Lãng mạn",
    "Sci-Fi": "Khoa học viễn tưởng",
    "Thriller": "Giật gân",
    "War": "Chiến tranh",
    "Western": "Miền Tây",
};

const ALL_GENRES = Object.values(GENRE_MAPPING);


interface GenrePickerProps {
    selectedGenres: string[];
    onChange: (genres: string[]) => void;
}

export default function GenrePicker({ selectedGenres, onChange }: GenrePickerProps) {
    const toggleGenre = (genreKey: string) => {
        const next = selectedGenres.includes(genreKey)
            ? selectedGenres.filter((g) => g !== genreKey)
            : [...selectedGenres, genreKey];
        onChange(next);
    };

    return (
        <View style={styles.container}>
            {Object.entries(GENRE_MAPPING).map(([key, label]) => {
                const isSelected = selectedGenres.includes(key);
                return (
                    <TouchableOpacity
                        key={key}
                        onPress={() => toggleGenre(key)}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.text, isSelected && styles.textSelected]}>
                            {label}
                        </Text>
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
        backgroundColor: "#f0f0f0",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        margin: 4,
    },
    chipSelected: {
        backgroundColor: "#007AFF",
        borderColor: "#007AFF",
    },
    text: {
        fontSize: 14,
        color: "#333",
    },
    textSelected: {
        color: "#fff",
        fontWeight: "bold",
    },
});
