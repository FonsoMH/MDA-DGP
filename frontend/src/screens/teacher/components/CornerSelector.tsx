import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";

export type CornerOption =
  | "derecha"
  | "izquierda"

interface CornerSelectorProps {
  onChange: (value: CornerOption) => void;
  actualSelected: string;
}

export default function CornerSelector({ onChange , actualSelected }: CornerSelectorProps) {
  const [selected, setSelected] = useState<string | null>(actualSelected);

  const handleSelect = (key: string) => {
    setSelected(key);
    onChange(key as CornerOption);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Option
            selected={selected === "izquierda"}
            onPress={() => handleSelect("izquierda")}
        />
        <Option
            selected={selected === "derecha"}
            onPress={() => handleSelect("derecha")}
        />
      </View>
    </View>
  );
}

interface OptionProps {
  selected: boolean;
  onPress: (event: GestureResponderEvent) => void;
}

function Option({ selected, onPress }: OptionProps) {
  return (
    <TouchableOpacity
      style={[styles.option, selected && styles.selected]}
      onPress={onPress}
    />
);
}

const styles = StyleSheet.create({
  container: {
    margin: 8,
    width: 40
  },
  row: {
    flexDirection: "row",
  },
  option: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: "#bbb",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: {
    backgroundColor: "#4b9dfc",
    borderColor: "#1a73e8",
  },
  text: {
    color: "#000",
    fontWeight: "600",
  },
});
