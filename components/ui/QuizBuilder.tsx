import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Typography';
import Card from './Card';
import { QuizQuestion } from '../../lib/types';

interface QuizBuilderProps {
  onSave: (questions: QuizQuestion[]) => void;
  initialQuestions?: QuizQuestion[];
}

export default function QuizBuilder({ onSave, initialQuestions = [] }: QuizBuilderProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initialQuestions.length > 0 
      ? initialQuestions 
      : [{
          $id: '1',
          quizId: '',
          type: 'multiple-choice',
          question: '',
          options: ['', '', '', ''],
          correctAnswer: '',
          points: 10,
          order: 1,
        }]
  );

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      $id: String(questions.length + 1),
      quizId: '',
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10,
      order: questions.length + 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    const options = [...(updatedQuestions[questionIndex].options as string[])];
    options[optionIndex] = value;
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], options };
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      Alert.alert('Cannot Remove', 'A quiz must have at least one question');
      return;
    }
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const handleSave = () => {
    // Validate questions
    const invalidQuestions = questions.filter(q => 
      !q.question.trim() || 
      !q.correctAnswer.trim() ||
      (Array.isArray(q.options) && q.options.some(opt => !opt.trim()))
    );

    if (invalidQuestions.length > 0) {
      Alert.alert('Validation Error', 'Please fill in all question fields and options');
      return;
    }

    onSave(questions);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="h2" style={styles.title}>Quiz Builder</Text>
        <Text variant="body2" style={styles.subtitle}>
          Create engaging quiz questions for your students
        </Text>
      </View>

      {questions.map((question, questionIndex) => (
        <Card key={question.$id} variant="elevated" style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text variant="h4" style={styles.questionNumber}>
              Question {questionIndex + 1}
            </Text>
            {questions.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeQuestion(questionIndex)}
              >
                <Ionicons name="trash-outline" size={20} color="#dc3545" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text variant="h6" style={styles.label}>Question Text</Text>
            <TextInput
              style={styles.textInput}
              value={question.question}
              onChangeText={(text) => updateQuestion(questionIndex, 'question', text)}
              placeholder="Enter your question here..."
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text variant="h6" style={styles.label}>Question Type</Text>
            <View style={styles.typeSelector}>
              {[
                { value: 'multiple-choice', label: 'Multiple Choice' },
                { value: 'true-false', label: 'True/False' },
                { value: 'short-answer', label: 'Short Answer' },
              ].map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeOption,
                    question.type === type.value && styles.typeOptionActive
                  ]}
                  onPress={() => updateQuestion(questionIndex, 'type', type.value)}
                >
                  <Text variant="body2" style={[
                    styles.typeText,
                    question.type === type.value && styles.typeTextActive
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {question.type === 'multiple-choice' && (
            <View style={styles.inputGroup}>
              <Text variant="h6" style={styles.label}>Answer Options</Text>
              {(question.options as string[]).map((option, optionIndex) => (
                <View key={optionIndex} style={styles.optionRow}>
                  <TouchableOpacity
                    style={[
                      styles.correctIndicator,
                      question.correctAnswer === option && styles.correctIndicatorActive
                    ]}
                    onPress={() => updateQuestion(questionIndex, 'correctAnswer', option)}
                  >
                    <Ionicons 
                      name={question.correctAnswer === option ? "checkmark-circle" : "radio-button-off"} 
                      size={20} 
                      color={question.correctAnswer === option ? "#28a745" : "#6c757d"} 
                    />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.optionInput, { flex: 1 }]}
                    value={option}
                    onChangeText={(text) => updateOption(questionIndex, optionIndex, text)}
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                </View>
              ))}
            </View>
          )}

          {question.type === 'true-false' && (
            <View style={styles.inputGroup}>
              <Text variant="h6" style={styles.label}>Correct Answer</Text>
              <View style={styles.trueFalseSelector}>
                {['True', 'False'].map((answer) => (
                  <TouchableOpacity
                    key={answer}
                    style={[
                      styles.trueFalseOption,
                      question.correctAnswer === answer && styles.trueFalseOptionActive
                    ]}
                    onPress={() => updateQuestion(questionIndex, 'correctAnswer', answer)}
                  >
                    <Text variant="body2" style={[
                      styles.trueFalseText,
                      question.correctAnswer === answer && styles.trueFalseTextActive
                    ]}>
                      {answer}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {question.type === 'short-answer' && (
            <View style={styles.inputGroup}>
              <Text variant="h6" style={styles.label}>Correct Answer</Text>
              <TextInput
                style={styles.textInput}
                value={question.correctAnswer as string}
                onChangeText={(text) => updateQuestion(questionIndex, 'correctAnswer', text)}
                placeholder="Enter the correct answer..."
              />
            </View>
          )}

          <View style={styles.metaRow}>
            <View style={styles.pointsGroup}>
              <Text variant="body2" style={styles.label}>Points</Text>
              <TextInput
                style={styles.pointsInput}
                value={String(question.points)}
                onChangeText={(text) => updateQuestion(questionIndex, 'points', parseInt(text) || 10)}
                keyboardType="numeric"
                placeholder="10"
              />
            </View>
          </View>

          {question.explanation && (
            <View style={styles.inputGroup}>
              <Text variant="h6" style={styles.label}>Explanation (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={question.explanation}
                onChangeText={(text) => updateQuestion(questionIndex, 'explanation', text)}
                placeholder="Explain why this answer is correct..."
                multiline
              />
            </View>
          )}
        </Card>
      ))}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.addButton} onPress={addQuestion}>
          <Ionicons name="add-circle" size={24} color="#007bff" />
          <Text variant="h6" style={styles.addButtonText}>Add Question</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text variant="h6" style={styles.saveButtonText}>Save Quiz</Text>
          <Ionicons name="checkmark-circle" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6c757d',
    lineHeight: 20,
  },
  questionCard: {
    margin: 16,
    marginTop: 8,
    padding: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionNumber: {
    color: '#212529',
  },
  removeButton: {
    padding: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#495057',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#495057',
    minHeight: 48,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ced4da',
    backgroundColor: 'white',
  },
  typeOptionActive: {
    borderColor: '#007bff',
    backgroundColor: '#e3f2fd',
  },
  typeText: {
    color: '#6c757d',
  },
  typeTextActive: {
    color: '#007bff',
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  correctIndicator: {
    padding: 4,
  },
  correctIndicatorActive: {
    // Styles handled by icon color
  },
  optionInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#495057',
  },
  trueFalseSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  trueFalseOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  trueFalseOptionActive: {
    borderColor: '#28a745',
    backgroundColor: '#e8f5e8',
  },
  trueFalseText: {
    color: '#6c757d',
    fontWeight: '500',
  },
  trueFalseTextActive: {
    color: '#28a745',
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsGroup: {
    width: 100,
  },
  pointsInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#495057',
    textAlign: 'center',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007bff',
    borderStyle: 'dashed',
    backgroundColor: 'white',
    gap: 8,
  },
  addButtonText: {
    color: '#007bff',
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#28a745',
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});